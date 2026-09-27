import { Database, Workspace, emptyDatabase, emptyWorkspace } from '@/lib/research-model';

const KEY = 'arpis_database_v2';
export interface ResearchRepository { read(): Database; write(data: Database): void; }
export class LocalResearchRepository implements ResearchRepository {
  read(): Database {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyDatabase();
    const data = JSON.parse(raw) as Database;
    if (data.version !== 2 || !Array.isArray(data.accounts) || !data.workspaces) throw new Error('This saved workspace has an unsupported or damaged schema. Export/recover browser storage before resetting it.');
    for (const account of data.accounts) {
      const workspace = data.workspaces[account.id];
      if (!workspace) data.workspaces[account.id] = emptyWorkspace();
      else data.workspaces[account.id] = { ...emptyWorkspace(), ...workspace, settings: { ...emptyWorkspace().settings, ...workspace.settings } };
    }
    return data;
  }
  write(data: Database) { localStorage.setItem(KEY, JSON.stringify(data)); }
}
export const repository: ResearchRepository = new LocalResearchRepository();
export const storageKey = KEY;

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function validateImport(input: unknown): Workspace {
  if (!isObject(input) || input.version !== 2 || !isObject(input.workspace)) throw new Error('Choose an ARPIS version 2 JSON export.');
  const workspace = input.workspace;
  const lists = ['projects','papers','records','conversations','comparisons','activity','notifications'] as const;
  for (const key of lists) {
    const list = workspace[key];
    if (!Array.isArray(list) || list.length > 50000) throw new Error(`Invalid ${key} collection.`);
    const ids = new Set<string>();
    for (const row of list) {
      if (!isObject(row) || typeof row.id !== 'string' || !row.id || ids.has(row.id)) throw new Error(`Invalid or duplicate ID in ${key}.`);
      ids.add(row.id);
      const stringFields: Record<string,string[]> = {projects:['name','description','domain','createdAt','updatedAt'],papers:['title','projectId','abstract','journal','uploadedAt','status'],records:['kind','projectId','title','description','status','createdAt','updatedAt'],conversations:['title','projectId','updatedAt'],comparisons:['projectId','createdAt'],activity:['action','object','projectId','href','createdAt'],notifications:['action','object','projectId','href','createdAt']};
      for (const field of stringFields[key]) if (typeof row[field] !== 'string') throw new Error(`Invalid ${key}.${field}.`);
      for (const field of ['tags','authors','keywords','paperIds','linkedPaperIds','linkedNoteIds','linkedExperimentIds','linkedEvidenceIds']) {
        if (field in row && (!Array.isArray(row[field]) || !(row[field] as unknown[]).every(v=>typeof v==='string'))) throw new Error(`Invalid ${field}.`);
      }
      if ((key==='projects'||key==='papers'||key==='records') && !Array.isArray(row.tags)) throw new Error('Missing tags.');
      if (key==='papers' && (!Array.isArray(row.authors)||!Array.isArray(row.keywords)||typeof row.year!=='number')) throw new Error('Invalid paper metadata.');
      for (const field of ['content','source','section','note','rationale','method','parameters','version','license','variables','domain','paperId','experimentId','datasetId','hypothesisId','priority','fileName','fileType','doi','url','notes','icon','color']) if (field in row && row[field] !== undefined && typeof row[field] !== 'string') throw new Error(`Invalid ${key}.${field}.`);
      for (const field of ['favorite','archived','pinned','read']) if (field in row && typeof row[field] !== 'boolean') throw new Error(`Invalid ${key}.${field}.`);
      if (key==='papers' && !['Unread','Reading','Completed','Reviewed'].includes(String(row.status))) throw new Error('Invalid reading status.');
      for (const field of ['createdAt','updatedAt','uploadedAt']) if (field in row && (typeof row[field]!=='string'||!Number.isFinite(Date.parse(String(row[field]))))) throw new Error(`Invalid ${field}.`);
      if (key==='records' && !['questions','hypotheses','evidence','notes','datasets','experiments'].includes(String(row.kind))) throw new Error('Unknown research record type.');
      if (key==='conversations' && (!Array.isArray(row.messages)||!row.messages.every(m=>isObject(m)&&typeof m.id==='string'&&typeof m.content==='string'&&['user','assistant'].includes(String(m.role))))) throw new Error('Invalid conversation messages.');
      if (row.results !== undefined && (!Array.isArray(row.results)||!row.results.every(m=>isObject(m)&&['id','name','value','unit','notes'].every(k=>typeof m[k]==='string')))) throw new Error('Invalid measurements.');
      if (row.versions !== undefined && (!Array.isArray(row.versions)||!row.versions.every(m=>isObject(m)&&['version','date','note'].every(k=>typeof m[k]==='string')))) throw new Error('Invalid dataset versions.');
    }
  }
  const result = workspace as unknown as Workspace;
  const projectIds = new Set(result.projects.map(p=>p.id));
  for (const row of [...result.papers,...result.records,...result.conversations]) if (row.projectId && !projectIds.has(row.projectId)) throw new Error('An item references a missing project.');
  const allIds=[...result.projects,...result.papers,...result.records,...result.conversations].map(r=>r.id);
  if(new Set(allIds).size!==allIds.length) throw new Error('IDs must be unique across research collections.');
  for(const r of result.records){
    const linked=(id:string|undefined,kind:string)=>!id||kind==='papers'? !id||result.papers.some(p=>p.id===id&&p.projectId===r.projectId):result.records.some(other=>other.id===id&&other.kind===kind&&other.projectId===r.projectId);
    if(!linked(r.paperId,'papers')||!linked(r.datasetId,'datasets')||!linked(r.experimentId,'experiments')||!linked(r.hypothesisId,'hypotheses'))throw new Error('A research record links to a missing item or another project.');
    for(const [field,kind] of [['linkedPaperIds','papers'],['linkedNoteIds','notes'],['linkedExperimentIds','experiments'],['linkedEvidenceIds','evidence']] as const)if(r[field]?.some(id=>!linked(id,kind)))throw new Error(`Invalid ${field} reference.`);
  }
  return { ...result, settings: { ...emptyWorkspace().settings } };
}
export function mergeWorkspaces(current: Workspace, imported: Workspace): Workspace {
  const result = { ...current };
  for (const key of ['projects','papers','records','conversations','comparisons','activity','notifications'] as const) {
    // Existing IDs win: a merge never silently replaces local edits.
    const ids = new Set(current[key].map(item=>item.id));
    Object.assign(result, { [key]: [...current[key], ...imported[key].filter(item=>!ids.has(item.id))] });
  }
  return result;
}
export function legacyWorkspace(): Workspace {
  const result = emptyWorkspace();
  result.projects = JSON.parse(localStorage.getItem('arpis_projects_v1') || '[]');
  result.papers = JSON.parse(localStorage.getItem('arpis_papers_v1') || '[]');
  const old = JSON.parse(localStorage.getItem('arpis_research_v1') || '{}');
  result.records = (old.notes || []).map((n: Record<string,unknown>)=>({...n,kind:'notes',description:'',tags:[],status:'OPEN',createdAt:n.updatedAt}));
  result.conversations = old.conversations || [];
  result.comparisons = old.comparisons || [];
  return validateImport({version:2,workspace:result});
}

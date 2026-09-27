import type { Project } from './projects';
import type { Paper } from './papers';

export const domains = ['Computer Science','AI/ML','Physics','Chemistry','Biology','Medicine','Climate Science','Environmental Science','Mathematics','Engineering','Economics','Social Sciences','Astronomy','Materials Science','Robotics','Neuroscience','Psychology','Interdisciplinary','Other'];
export type RecordKind = 'questions' | 'hypotheses' | 'evidence' | 'notes' | 'datasets' | 'experiments';
export type Measurement = { id: string; name: string; value: string; unit: string; notes: string };
export type ResearchRecord = {
  id: string; kind: RecordKind; projectId: string; title: string; description: string;
  status: string; tags: string[]; createdAt: string; updatedAt: string;
  paperId?: string; experimentId?: string; datasetId?: string; hypothesisId?: string;
  linkedPaperIds?: string[]; linkedNoteIds?: string[]; linkedExperimentIds?: string[]; linkedEvidenceIds?: string[];
  priority?: string; content?: string; pinned?: boolean; source?: string; section?: string;
  note?: string; rationale?: string; method?: string; parameters?: string; results?: Measurement[];
  version?: string; license?: string; fileName?: string; fileType?: string; size?: number;
  variables?: string; domain?: string; versions?: { version: string; date: string; note: string }[];
};
export type Message = { id: string; role: 'user' | 'assistant'; content: string; createdAt: string };
export type Conversation = { id: string; projectId: string; title: string; messages: Message[]; createdAt?: string; updatedAt: string; archived?: boolean };
export type Profile = { name: string; email: string; institution: string; interests: string; domains: string[]; bio: string; orcid: string; website: string; location: string; citation: string; language: string; avatar: string; onboarded: boolean; verified: boolean };
export type Account = { id: string; salt: string; passwordHash: string; profile: Profile; demo?: boolean; reset?: { token: string; expires: number } };
export type Settings = { theme: 'dark'|'light'|'system'; density: 'comfortable'|'compact'; domain: string; provider: 'puter'; model: string; aiInstructions: string; activityNotifications: boolean; aiNotifications: boolean; systemNotifications: boolean };
export type Activity = { id: string; action: string; object: string; projectId: string; href: string; createdAt: string; read: boolean };
export type Workspace = { projects: Project[]; papers: Paper[]; records: ResearchRecord[]; conversations: Conversation[]; comparisons: { id: string; projectId: string; paperIds: string[]; createdAt: string }[]; activity: Activity[]; notifications: Activity[]; settings: Settings };
export type Database = { version: 2; revision: number; accounts: Account[]; session: string|null; workspaces: Record<string, Workspace> };
export const defaultSettings: Settings = { theme: 'dark', density: 'comfortable', domain: '', provider: 'puter', model: process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-3.1-flash-lite', aiInstructions: '', activityNotifications: true, aiNotifications: true, systemNotifications: true };
export const emptyWorkspace = (): Workspace => ({ projects: [], papers: [], records: [], conversations: [], comparisons: [], activity: [], notifications: [], settings: { ...defaultSettings } });
export const emptyDatabase = (): Database => ({version: 2, revision: 0, accounts: [], session: null, workspaces: {}});
export const blankProfile = (name: string, email: string): Profile => ({name,email,institution:'',interests:'',domains:[],bio:'',orcid:'',website:'',location:'',citation:'APA',language:'English',avatar:'',onboarded:false,verified:false});

export type Project = {
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  id: string;
  name: string;
  description: string;
  domain: string;
  tags: string[];
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  papers: number;
  notes: number;
  chats: number;
  comparisons: number;
  progress: number;
};

export const PROJECTS_STORAGE_KEY = "arpis_projects_v1";

export const seedProjects: Project[] = [
  { id:"ai-healthcare", name:"AI for Healthcare", description:"Clinical AI, diagnostics, and decision support", domain:"Healthcare", tags:["AI","Healthcare"], icon:"🧠", color:"#29f4ff", createdAt:"2026-07-01T10:00:00.000Z", updatedAt:"2026-07-21T06:00:00.000Z", papers:3, notes:4, chats:32, comparisons:12, progress:72 },
  { id:"llm-safety", name:"LLM Safety", description:"Alignment, scalable oversight, and model evaluation", domain:"AI", tags:["AI","NLP","Safety"], icon:"💻", color:"#a855ff", createdAt:"2026-07-05T10:00:00.000Z", updatedAt:"2026-07-20T06:00:00.000Z", papers:0, notes:9, chats:18, comparisons:5, progress:48 },
  { id:"computer-vision", name:"Computer Vision", description:"Vision transformers and low-data learning", domain:"AI", tags:["AI","Vision"], icon:"📄", color:"#ffb74d", createdAt:"2026-07-09T10:00:00.000Z", updatedAt:"2026-07-17T06:00:00.000Z", papers:0, notes:3, chats:11, comparisons:2, progress:31 },
];

export function slugifyProject(name: string) {
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "project"}-${Date.now().toString(36)}`;
}

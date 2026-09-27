"use client";
import { createContext,useCallback,useContext,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/projects';
import { useWorkspace } from '@/store/WorkspaceProvider';
type Value={projects:Project[];ready:boolean;storageError:string;openCreateProject:()=>void;getProject:(id:string)=>Project|undefined;updateProject:(id:string,changes:Partial<Project>)=>void;deleteProject:(id:string)=>void};
const Context=createContext<Value|null>(null);
export function ProjectProvider({children}:{children:React.ReactNode}){
 const {workspace,ready,error,mutate}=useWorkspace();const router=useRouter();const openCreateProject=useCallback(()=>router.push('/research/new'),[router]);
 useEffect(()=>{window.addEventListener('arpis-new-project',openCreateProject);return()=>window.removeEventListener('arpis-new-project',openCreateProject);},[openCreateProject]);
 return <Context.Provider value={{projects:workspace.projects,ready,storageError:error,openCreateProject,getProject:id=>workspace.projects.find(p=>p.id===id),updateProject:(id,changes)=>mutate(w=>{w.projects=w.projects.map(p=>p.id===id?{...p,...changes,updatedAt:new Date().toISOString()}:p);},'Project updated',changes.name||'',id,`/projects/${id}`),deleteProject:id=>mutate(w=>{w.projects=w.projects.filter(p=>p.id!==id);w.papers=w.papers.filter(p=>p.projectId!==id);w.records=w.records.filter(r=>r.projectId!==id);w.conversations=w.conversations.filter(c=>c.projectId!==id);w.comparisons=w.comparisons.filter(c=>c.projectId!==id);},'Project deleted')}}>{children}</Context.Provider>;
}
export function useProjects(){const value=useContext(Context);if(!value)throw new Error('ProjectProvider required');return value;}

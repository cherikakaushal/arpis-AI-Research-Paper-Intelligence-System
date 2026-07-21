"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Project, PROJECTS_STORAGE_KEY, seedProjects, slugifyProject } from "@/lib/projects";
import NewProjectModal, { NewProjectInput } from "./NewProjectModal";

type ProjectContextValue = { projects: Project[]; ready: boolean; openCreateProject: () => void; getProject: (id:string) => Project | undefined; updateProject: (id:string,changes:Partial<Project>)=>void };
const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({children}:{children:React.ReactNode}) {
  const [projects,setProjects]=useState<Project[]>([]);
  const [ready,setReady]=useState(false);
  const [modalOpen,setModalOpen]=useState(false);
  const router=useRouter();

  useEffect(()=>{
    const load=window.setTimeout(()=>{
      const saved=localStorage.getItem(PROJECTS_STORAGE_KEY);
      const initial=saved ? JSON.parse(saved) as Project[] : seedProjects;
      if(!saved) localStorage.setItem(PROJECTS_STORAGE_KEY,JSON.stringify(initial));
      setProjects(initial);
      setReady(true);
    },0);
    return()=>window.clearTimeout(load);
  },[]);

  useEffect(()=>{ const open=()=>setModalOpen(true); window.addEventListener("arpis-new-project",open); return()=>window.removeEventListener("arpis-new-project",open); },[]);
  const openCreateProject=useCallback(()=>setModalOpen(true),[]);
  const createProject=(input:NewProjectInput)=>{
    const now=new Date().toISOString();
    const project:Project={...input,id:slugifyProject(input.name),createdAt:now,updatedAt:now,papers:0,notes:0,chats:0,comparisons:0,progress:0};
    const next=[project,...projects]; setProjects(next); localStorage.setItem(PROJECTS_STORAGE_KEY,JSON.stringify(next)); setModalOpen(false); router.push(`/projects/${project.id}`);
  };
  const updateProject=(id:string,changes:Partial<Project>)=>setProjects(current=>{const next=current.map(project=>project.id===id?{...project,...changes,updatedAt:new Date().toISOString()}:project);localStorage.setItem(PROJECTS_STORAGE_KEY,JSON.stringify(next));return next});
  return <ProjectContext.Provider value={{projects,ready,openCreateProject,getProject:(id)=>projects.find(p=>p.id===id),updateProject}}>{children}<NewProjectModal open={modalOpen} onClose={()=>setModalOpen(false)} onCreate={createProject}/></ProjectContext.Provider>;
}

export function useProjects(){ const value=useContext(ProjectContext); if(!value) throw new Error("useProjects must be inside ProjectProvider"); return value; }

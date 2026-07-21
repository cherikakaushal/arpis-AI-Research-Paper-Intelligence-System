"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext,useContext,useEffect,useState } from "react";
import { Paper,PAPERS_STORAGE_KEY,ReadingStatus,seedPapers } from "@/lib/papers";
import { useProjects } from "@/components/projects/ProjectProvider";
type Value={papers:Paper[];ready:boolean;getPaper:(id:string)=>Paper|undefined;getProjectPapers:(projectId:string)=>Paper[];addPaper:(paper:Paper,pdfUrl?:string)=>void;updatePaper:(id:string,changes:Partial<Paper>)=>void};
const Context=createContext<Value|null>(null);
export function PaperProvider({children}:{children:React.ReactNode}){const [papers,setPapers]=useState<Paper[]>([]),[ready,setReady]=useState(false);const {getProject,updateProject}=useProjects();useEffect(()=>{const timer=setTimeout(()=>{const saved=localStorage.getItem(PAPERS_STORAGE_KEY);const initial=saved?JSON.parse(saved) as Paper[]:seedPapers;if(!saved)localStorage.setItem(PAPERS_STORAGE_KEY,JSON.stringify(initial));setPapers(initial);setReady(true)},0);return()=>clearTimeout(timer)},[]);const persist=(next:Paper[])=>{setPapers(next);localStorage.setItem(PAPERS_STORAGE_KEY,JSON.stringify(next))};const addPaper=(paper:Paper,pdfUrl?:string)=>{const next=[paper,...papers];persist(next);if(pdfUrl)sessionStorage.setItem(`arpis_pdf_${paper.id}`,pdfUrl);updateProject(paper.projectId,{papers:next.filter(item=>item.projectId===paper.projectId).length})};const updatePaper=(id:string,changes:Partial<Paper>)=>persist(papers.map(p=>p.id===id?{...p,...changes}:p));return <Context.Provider value={{papers,ready,getPaper:id=>papers.find(p=>p.id===id),getProjectPapers:id=>papers.filter(p=>p.projectId===id),addPaper,updatePaper}}>{children}</Context.Provider>}
export function usePapers(){const value=useContext(Context);if(!value)throw new Error("usePapers must be inside PaperProvider");return value}
export const statuses:ReadingStatus[]=["Unread","Reading","Completed","Reviewed"];

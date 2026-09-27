"use client";
import { createContext,useContext,useEffect,useState } from "react";
import { Paper,PAPERS_STORAGE_KEY,ReadingStatus,seedPapers } from "@/lib/papers";
import { deletePdf } from "@/lib/pdfStore";
import { useProjects } from "@/components/projects/ProjectProvider";
type Value={papers:Paper[];ready:boolean;storageError:string;getPaper:(id:string)=>Paper|undefined;getProjectPapers:(projectId:string)=>Paper[];addPaper:(paper:Paper,pdfUrl?:string)=>void;updatePaper:(id:string,changes:Partial<Paper>)=>void;deletePaper:(id:string)=>void;deleteProjectPapers:(projectId:string)=>void};
const Context=createContext<Value|null>(null);
export function PaperProvider({children}:{children:React.ReactNode}){
 const [papers,setPapers]=useState<Paper[]>([]),[ready,setReady]=useState(false),[storageError,setStorageError]=useState("");
 const {updateProject}=useProjects();
 useEffect(()=>{
  const timer=setTimeout(()=>{
   let initial=seedPapers;
    try{const saved=localStorage.getItem(PAPERS_STORAGE_KEY);if(saved){const parsed:unknown=JSON.parse(saved);if(Array.isArray(parsed))initial=parsed as Paper[];else setStorageError("Saved papers could not be read. The sample library is being shown.")}else localStorage.setItem(PAPERS_STORAGE_KEY,JSON.stringify(initial))}catch{initial=seedPapers;setStorageError("Saved papers could not be read from browser storage. New changes may not persist.")}
   setPapers(initial);setReady(true)
  },0);
  return()=>clearTimeout(timer)
 },[]);
 const persist=(next:Paper[])=>{setPapers(next);try{localStorage.setItem(PAPERS_STORAGE_KEY,JSON.stringify(next));setStorageError("")}catch{setStorageError("Paper changes are only in memory because browser storage is unavailable.")}}
 const addPaper=(paper:Paper,pdfUrl?:string)=>{const next=[paper,...papers];persist(next);if(pdfUrl){try{sessionStorage.setItem(`arpis_pdf_${paper.id}`,pdfUrl)}catch{}}updateProject(paper.projectId,{papers:next.filter(item=>item.projectId===paper.projectId).length})};
 const updatePaper=(id:string,changes:Partial<Paper>)=>persist(papers.map(p=>p.id===id?{...p,...changes}:p));
 const deletePaper=(id:string)=>{const paper=papers.find(item=>item.id===id);const next=papers.filter(item=>item.id!==id);persist(next);void deletePdf(id).catch(()=>{});if(paper)updateProject(paper.projectId,{papers:next.filter(item=>item.projectId===paper.projectId).length});};
 const deleteProjectPapers=(projectId:string)=>{const removed=papers.filter(paper=>paper.projectId===projectId);persist(papers.filter(paper=>paper.projectId!==projectId));removed.forEach(paper=>void deletePdf(paper.id).catch(()=>{}));};
 return <Context.Provider value={{papers,ready,storageError,getPaper:id=>papers.find(p=>p.id===id),getProjectPapers:id=>papers.filter(p=>p.projectId===id),addPaper,updatePaper,deletePaper,deleteProjectPapers}}>{children}</Context.Provider>
}
export function usePapers(){const value=useContext(Context);if(!value)throw new Error("usePapers must be inside PaperProvider");return value}
export const statuses:ReadingStatus[]=["Unread","Reading","Completed","Reviewed"];

"use client";
import { Conversation } from '@/lib/research-model';
import { useWorkspace } from '@/store/WorkspaceProvider';
type Note={id:string;projectId:string;paperId?:string;title:string;content:string;updatedAt:string};
export function ResearchProvider({children}:{children:React.ReactNode}){return children;}
export function useResearch(){const {workspace,mutate,ready,error}=useWorkspace();return {...workspace,notes:workspace.records.filter(r=>r.kind==='notes').map(r=>({...r,content:r.content||''})),ready,storageError:error,
 saveNote:(note:Note)=>mutate(w=>{const old=w.records.find(r=>r.id===note.id);w.records=[{kind:'notes',description:'',status:'OPEN',tags:[],createdAt:note.updatedAt,...old,...note},...w.records.filter(r=>r.id!==note.id)];},'Note saved',note.title,note.projectId,`/notes/${note.id}`),
 deleteNote:(id:string)=>mutate(w=>{w.records=w.records.filter(r=>r.id!==id);},'Note deleted'),
 createConversation:(projectId:string,title:string)=>{const now=new Date().toISOString(),c={id:crypto.randomUUID(),projectId,title,messages:[],createdAt:now,updatedAt:now};mutate(w=>{w.conversations.unshift(c);});return c;},
 saveConversation:(c:Conversation)=>mutate(w=>{w.conversations=[c,...w.conversations.filter(item=>item.id!==c.id)];}),
 deleteConversation:(id:string)=>mutate(w=>{w.conversations=w.conversations.filter(c=>c.id!==id);}),
 saveComparison:(projectId:string,paperIds:string[])=>mutate(w=>{w.comparisons.unshift({id:crypto.randomUUID(),projectId,paperIds,createdAt:new Date().toISOString()});},'Comparison saved','',projectId),
 deleteProjectData:(id:string)=>mutate(w=>{w.records=w.records.filter(r=>r.projectId!==id);w.conversations=w.conversations.filter(c=>c.projectId!==id);w.comparisons=w.comparisons.filter(c=>c.projectId!==id);}),
 deletePaperData:(id:string)=>mutate(w=>{w.records=w.records.map(r=>({...r,paperId:r.paperId===id?'':r.paperId}));w.comparisons=w.comparisons.filter(c=>!c.paperIds.includes(id));})};}

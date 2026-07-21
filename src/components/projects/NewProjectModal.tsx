"use client";
import { FormEvent, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import styles from "./NewProjectModal.module.css";

export type NewProjectInput={name:string;description:string;domain:string;tags:string[];icon:string;color:string};
const icons=["🧠","📄","⚛️","🧬","💻"];
const colors=["#29f4ff","#a855ff","#ffb74d","#52d273","#ff6b9a"];
export default function NewProjectModal({open,onClose,onCreate}:{open:boolean;onClose:()=>void;onCreate:(input:NewProjectInput)=>void}){
 const [name,setName]=useState(""); const [description,setDescription]=useState(""); const [domain,setDomain]=useState("AI"); const [tags,setTags]=useState(""); const [icon,setIcon]=useState(icons[0]); const [color,setColor]=useState(colors[0]);
 useEffect(()=>{if(!open)return; const key=(e:KeyboardEvent)=>e.key==="Escape"&&onClose(); window.addEventListener("keydown",key); return()=>window.removeEventListener("keydown",key)},[open,onClose]);
 if(!open)return null;
 const submit=(e:FormEvent)=>{e.preventDefault();if(!name.trim())return;onCreate({name:name.trim(),description:description.trim(),domain,tags:tags.split(",").map(t=>t.trim()).filter(Boolean),icon,color});setName("");setDescription("");setTags("")};
 return <div className={styles.backdrop} onMouseDown={(e)=>e.target===e.currentTarget&&onClose()}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="new-project-title"><header><div><span>New workspace</span><h2 id="new-project-title">Create New Project</h2></div><button onClick={onClose} aria-label="Close"><FiX/></button></header><form onSubmit={submit}><label>Project Name *<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. AI for Healthcare" required/></label><label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What is this research project about?" rows={3}/></label><label>Research Domain<select value={domain} onChange={e=>setDomain(e.target.value)}><option>AI</option><option>Healthcare</option><option>Physics</option><option>Biology</option><option>Custom</option></select></label><label>Tags<input value={tags} onChange={e=>setTags(e.target.value)} placeholder="AI, NLP, Healthcare"/></label><fieldset><legend>Color / Icon</legend><div className={styles.pickers}>{icons.map(item=><button type="button" className={icon===item?styles.selected:""} onClick={()=>setIcon(item)} key={item}>{item}</button>)}</div><div className={styles.colors}>{colors.map(item=><button type="button" aria-label={`Select ${item}`} className={color===item?styles.selectedColor:""} style={{background:item}} onClick={()=>setColor(item)} key={item}/>)}</div></fieldset><footer><button type="button" onClick={onClose}>Cancel</button><button className={styles.create} type="submit" disabled={!name.trim()}>Create Project</button></footer></form></section></div>
}

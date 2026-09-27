"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft,FiFileText,FiUploadCloud } from "react-icons/fi";
import { useProjects } from "./ProjectProvider";
import ProjectTools, { Mode } from "./ProjectTools";
import styles from "./ProjectSection.module.css";
export default function ProjectSection({title,description}:{title:string;description:string}){
 const {id}=useParams<{id:string}>();
 const {getProject,ready}=useProjects();
 const project=getProject(id);
 const isPapers=title==="Papers";
 return <main className={styles.page}>
  <Link className={styles.back} href={`/projects/${id}`}><FiArrowLeft/> {project?.name??"Overview"}</Link>
  <header><span>Project workspace</span><h1>{title}</h1><p>{description}</p></header>
  {!ready?<p className={styles.placeholder}>Loading project…</p>:!project?<section className={styles.placeholder}><h2>Project not found</h2><Link href="/projects">Return to projects</Link></section>:isPapers&&project.papers===0?<section className={styles.empty}><div><FiFileText/></div><h2>No papers yet.</h2><p>Upload your first paper to begin building this project.</p><div className={styles.actions}><Link href={`/projects/${id}/papers/upload`}><FiUploadCloud/> Upload PDF</Link></div></section>:<ProjectTools projectId={id} mode={title as Mode}/>}
 </main>
}

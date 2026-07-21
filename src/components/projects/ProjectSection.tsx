"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft,FiBookOpen,FiFileText,FiGlobe,FiHash,FiUploadCloud } from "react-icons/fi";
import { useProjects } from "./ProjectProvider";
import styles from "./ProjectSection.module.css";
export default function ProjectSection({title,description}:{title:string;description:string}){const {id}=useParams<{id:string}>();const {getProject}=useProjects();const project=getProject(id);const isPapers=title==="Papers";return <main className={styles.page}><Link className={styles.back} href={`/projects/${id}`}><FiArrowLeft/> {project?.name??"Overview"}</Link><header><span>Project workspace</span><h1>{title}</h1><p>{description}</p></header>{isPapers&&project?.papers===0?<section className={styles.empty}><div><FiFileText/></div><h2>No papers yet.</h2><p>Upload your first paper or import a source to begin building this project.</p><div className={styles.actions}><button><FiUploadCloud/> Upload PDF</button><button><FiBookOpen/> Import from arXiv</button><button><FiHash/> Import DOI</button><button><FiGlobe/> Import URL</button></div></section>:<section className={styles.placeholder}><h2>{isPapers?`${project?.papers??0} papers in this project`:`${title} is ready for project context.`}</h2><p>Backend persistence and feature data will connect here in the next phase.</p></section>}</main>}

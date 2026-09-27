"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowRight, FiBookOpen, FiFileText, FiMessageSquare, FiPlus } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import styles from "./project.module.css";

export default function ProjectOverview() {
  const { id } = useParams<{ id: string }>();
  const { getProject, ready: projectsReady } = useProjects();
  const { getProjectPapers, ready: papersReady } = usePapers();
  const { notes, conversations, comparisons, ready: researchReady } = useResearch();
  const project = getProject(id);
  if (!projectsReady || !papersReady || !researchReady) return <main className={styles.page}>Loading project…</main>;
  if (!project) return <main className={styles.page}><h1>Project not found</h1><Link href="/projects">Return to projects</Link></main>;

  const projectPapers = getProjectPapers(id).slice().sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  const projectNotes = notes.filter((note) => note.projectId === id);
  const projectConversations = conversations.filter((thread) => thread.projectId === id).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const projectComparisons = comparisons.filter((comparison) => comparison.projectId === id);
  const reviewed = projectPapers.filter((paper) => paper.status === "Reviewed" || paper.status === "Completed").length;
  const progress = projectPapers.length ? Math.round((reviewed / projectPapers.length) * 100) : 0;

  return <main className={styles.page}>
    <header><div><span>{project.domain}{project.tags.length ? ` · ${project.tags.join(" · ")}` : ""}</span><h1>{project.icon} {project.name}</h1><p>{project.description}</p></div><Link className={styles.addPaper} href={`/projects/${id}/papers/upload`}><FiPlus/> Add paper</Link></header>
    <div className={styles.metrics}><article><strong>{projectPapers.length}</strong><span>Papers</span></article><article><strong>{projectNotes.length}</strong><span>Notes</span></article><article><strong>{projectConversations.length}</strong><span>Conversations</span></article><article><strong>{projectComparisons.length}</strong><span>Comparisons</span></article></div>
    <section className={styles.progressCard}><div><h2>Paper review progress</h2><strong>{progress}%</strong></div><div className={styles.progress}><span style={{ width: `${progress}%`, background: project.color }}/></div></section>
    <div className={styles.columns}>
      <section className={styles.card}><div className={styles.heading}><div><h2>Recent Papers</h2><p>Latest sources in this project</p></div><FiFileText/></div>{projectPapers.length ? <div className={styles.list}>{projectPapers.slice(0, 4).map((paper) => <Link href={`/projects/${id}/papers/${paper.id}`} key={paper.id}><span>{paper.title}</span><small>{paper.status} · {paper.year}</small></Link>)}</div> : <Empty label="No papers yet." action="Upload your first paper" href={`/projects/${id}/papers/upload`}/>}</section>
      <section className={styles.card}><div className={styles.heading}><div><h2>Recent Conversations</h2><p>Local searches across saved paper metadata</p></div><FiMessageSquare/></div>{projectConversations.length ? <div className={styles.list}>{projectConversations.slice(0, 4).map((thread) => <Link href={`/projects/${id}/chat`} key={thread.id}><span>{thread.title}</span><small>{thread.messages.length} messages · {new Date(thread.updatedAt).toLocaleDateString()}</small></Link>)}</div> : <Empty label="No conversations yet." action="Search project papers" href={`/projects/${id}/chat`}/>}</section>
      <section className={styles.card}><div className={styles.heading}><div><h2>Recent Notes</h2><p>Saved project and paper notes</p></div><FiBookOpen/></div>{projectNotes.length ? <div className={styles.list}>{projectNotes.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4).map((note) => <Link href={note.paperId ? `/projects/${id}/papers/${note.paperId}/notes` : `/projects/${id}/notes`} key={note.id}><span>{note.title}</span><small>{new Date(note.updatedAt).toLocaleDateString()}</small></Link>)}</div> : <Empty label="No notes yet." action="Create a project note" href={`/projects/${id}/notes`}/>}</section>
      <section className={styles.card}><div className={styles.heading}><div><h2>Project tools</h2><p>Continue working with this project’s sources</p></div><FiArrowRight/></div><div className={styles.list}><Link href={`/projects/${id}/compare`}><span>Compare papers</span><small>Review saved source metadata</small></Link><Link href={`/projects/${id}/graph`}><span>Knowledge graph</span><small>Explore shared tags and keywords</small></Link><Link href={`/projects/${id}/review`}><span>Literature review</span><small>Draft a source-based outline</small></Link></div></section>
    </div>
  </main>;
}

function Empty({ label, action, href }: { label: string; action: string; href: string }) {
  return <div className={styles.empty}><p>{label}</p><Link href={href}>{action} <FiArrowRight/></Link></div>;
}

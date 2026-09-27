"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiFileText, FiMessageSquare, FiSearch } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import styles from "./history.module.css";

type Activity = { id: string; kind: string; title: string; details: string; date: string; href: string };

export default function HistoryPage() {
  const { papers, ready: papersReady } = usePapers();
  const { projects, ready: projectsReady } = useProjects();
  const { notes, conversations, comparisons, ready: researchReady } = useResearch();
  const [query, setQuery] = useState("");
  const activity = useMemo<Activity[]>(() => [
    ...papers.map((paper) => ({ id: `paper-${paper.id}`, kind: "Paper", title: paper.title, details: `${projects.find((project) => project.id === paper.projectId)?.name ?? "Project"} · ${paper.authors.join(", ") || "Author not recorded"}`, date: paper.uploadedAt, href: `/projects/${paper.projectId}/papers/${paper.id}` })),
    ...notes.map((note) => ({ id: `note-${note.id}`, kind: "Note", title: note.title, details: projects.find((project) => project.id === note.projectId)?.name ?? "Project", date: note.updatedAt, href: `/projects/${note.projectId}/notes` })),
    ...conversations.map((thread) => ({ id: `chat-${thread.id}`, kind: "Conversation", title: thread.title, details: `${projects.find((project) => project.id === thread.projectId)?.name ?? "Project"} · ${thread.messages.length} messages`, date: thread.updatedAt, href: `/projects/${thread.projectId}/chat` })),
    ...comparisons.map((comparison) => ({ id: `compare-${comparison.id}`, kind: "Comparison", title: `${comparison.paperIds.length} paper comparison`, details: projects.find((project) => project.id === comparison.projectId)?.name ?? "Project", date: comparison.createdAt, href: `/projects/${comparison.projectId}/compare` })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [papers, notes, conversations, comparisons, projects]);
  const filtered = activity.filter((item) => `${item.kind} ${item.title} ${item.details}`.toLowerCase().includes(query.toLowerCase()));
  const ready = papersReady && projectsReady && researchReady;

  return <main className={styles.page}>
    <header><span>Research trail</span><h1>History</h1><p>Recent activity across your projects, saved in this browser.</p></header>
    <label className={styles.search}><FiSearch/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activity" aria-label="Search activity"/></label>
    {!ready ? <p role="status">Loading activity…</p> : filtered.length === 0 ? <section className={styles.empty}><FiFileText/><h2>{query ? "No matching activity" : "No activity yet"}</h2><p>{query ? "Try another title or project name." : "Upload a paper or add a project note to start your research trail."}</p><Link href={projects[0] ? `/projects/${projects[0].id}` : "/projects"}>Open a project</Link></section> : <ol className={styles.list}>{filtered.map((item) => <li key={item.id}><span className={styles.icon}>{item.kind === "Conversation" ? <FiMessageSquare/> : <FiFileText/>}</span><div className={styles.copy}><small>{item.kind} · {new Date(item.date).toLocaleString()}</small><h2>{item.title}</h2><p>{item.details}</p></div><Link href={item.href}>Open</Link></li>)}</ol>}
  </main>;
}

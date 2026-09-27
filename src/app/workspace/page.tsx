"use client";

import Link from "next/link";
import { useState } from "react";
import { FiFileText, FiMessageSquare, FiPlus, FiSearch, FiStar } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import "./workspace.css";

type Tab = "all" | "favorites" | "collections" | "notes" | "comparisons";
const tabs: { id: Tab; label: string }[] = [{ id: "all", label: "All Papers" }, { id: "favorites", label: "Favorites" }, { id: "collections", label: "Projects" }, { id: "notes", label: "Notes" }, { id: "comparisons", label: "Comparisons" }];

export default function WorkspacePage() {
  const { papers, ready: papersReady, updatePaper } = usePapers();
  const { projects, ready: projectsReady } = useProjects();
  const { notes, comparisons, ready: researchReady } = useResearch();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const ready = papersReady && projectsReady && researchReady;
  const filteredPapers = papers.filter((paper) => (tab !== "favorites" || paper.favorite) && `${paper.title} ${paper.authors.join(" ")} ${paper.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));

  return <div className="workspace-container">
    <aside className="workspace-sidebar"><h2 className="sidebar-title">Workspace</h2><nav className="workspace-nav" aria-label="Workspace views">{tabs.map((item) => <button key={item.id} type="button" className={tab === item.id ? "active" : ""} aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav><Link className="add-button" href="/upload"><FiPlus/> Add Paper</Link></aside>
    <main className="workspace-main">
      <h1 className="workspace-title">{tabs.find((item) => item.id === tab)?.label}</h1>
      <p className="workspace-sub">{tab === "all" ? "All papers saved across your projects" : tab === "favorites" ? "Your starred papers" : tab === "collections" ? "Project research libraries" : tab === "notes" ? "Notes connected to your projects and papers" : "Saved paper comparisons"}</p>
      {!ready ? <p role="status">Loading workspace…</p> : tab === "collections" ? <div className="paper-grid">{projects.map((project) => <article className="paper-card" key={project.id}><h2><Link href={`/projects/${project.id}`}>{project.icon} {project.name}</Link></h2><p className="paper-meta">{papers.filter((paper) => paper.projectId === project.id).length} papers · {project.domain}</p><Link href={`/projects/${project.id}/papers`}>Open project library →</Link></article>)}</div> : tab === "notes" ? <div className="paper-grid">{notes.length ? notes.map((note) => <article className="paper-card" key={note.id}><h2>{note.title}</h2><p className="paper-meta">{projects.find((project) => project.id === note.projectId)?.name ?? "Project"}</p><p>{note.content.slice(0, 180) || "Empty note"}</p><Link href={note.paperId ? `/projects/${note.projectId}/papers/${note.paperId}/notes` : `/projects/${note.projectId}/notes`}>Open note →</Link></article>) : <p className="empty">No saved notes yet.</p>}</div> : tab === "comparisons" ? <div className="paper-grid">{comparisons.length ? comparisons.map((comparison) => <article className="paper-card" key={comparison.id}><h2>{comparison.paperIds.map((paperId) => papers.find((paper) => paper.id === paperId)?.title ?? "Removed paper").join(" · ")}</h2><p className="paper-meta">{projects.find((project) => project.id === comparison.projectId)?.name ?? "Project"}</p><Link href={`/projects/${comparison.projectId}/compare`}>Open comparison →</Link></article>) : <p className="empty">No comparisons saved yet.</p>}</div> : <>
        <label className="workspace-search"><FiSearch/><input aria-label="Search papers" placeholder="Search titles, authors, and tags" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
        {filteredPapers.length === 0 ? <p className="empty">{papers.length ? "No papers match this view." : "No papers saved yet. Add a paper to a project to see it here."}</p> : <div className="paper-grid">{filteredPapers.map((paper) => <article key={paper.id} className="paper-card"><div className="paper-header"><h2><Link href={`/projects/${paper.projectId}/papers/${paper.id}`}>{paper.title}</Link></h2><button type="button" className={`fav-btn ${paper.favorite ? "active" : ""}`} aria-label={paper.favorite ? `Remove ${paper.title} from favorites` : `Add ${paper.title} to favorites`} aria-pressed={paper.favorite} onClick={() => updatePaper(paper.id, { favorite: !paper.favorite })}><FiStar/></button></div><p className="paper-meta">{projects.find((project) => project.id === paper.projectId)?.name ?? "Project"} · {paper.year} · {paper.status}</p><div className="paper-tags">{paper.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div><div className="paper-links"><Link href={`/projects/${paper.projectId}/papers/${paper.id}`}>Details</Link><Link href={`/projects/${paper.projectId}/papers/${paper.id}/reader`}><FiFileText/> Read</Link><Link href={`/projects/${paper.projectId}/chat`}><FiMessageSquare/> Search</Link></div></article>)}</div>}
      </>}
    </main>
  </div>;
}

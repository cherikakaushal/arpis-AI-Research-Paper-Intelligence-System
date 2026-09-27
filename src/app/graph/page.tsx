"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiGitBranch, FiSearch } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import styles from "./graph.module.css";

export default function CitationGraph() {
  const { papers, ready: papersReady } = usePapers();
  const { projects, ready: projectsReady } = useProjects();
  const [query, setQuery] = useState("");
  const terms = (paper: typeof papers[number]) => [...new Set([...paper.tags, ...paper.keywords].map((term) => term.trim().toLowerCase()).filter(Boolean))];
  const filtered = useMemo(() => papers.filter((paper) => `${paper.title} ${paper.authors.join(" ")} ${paper.tags.join(" ")} ${paper.keywords.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [papers, query]);
  const relations = filtered.flatMap((paper, index) => filtered.slice(index + 1).map((other) => ({ paper, other, shared: terms(paper).filter((term) => terms(other).includes(term)) })).filter((item) => item.shared.length));

  return <main className={styles.wrapper} style={{ height: "auto", minHeight: "calc(100vh - 70px)" }}>
    <header><h1 className={styles.title}>Knowledge Graph</h1><p className={styles.subtitle}>Explore relationships inferred from saved paper tags and keywords.</p></header>
    <label style={{ display: "flex", alignItems: "center", gap: 9, maxWidth: 560, margin: "16px 0", padding: "0 12px", border: "1px solid var(--arp-border-subtle)", borderRadius: 9 }}><FiSearch/><input aria-label="Filter graph papers" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter papers and topics" style={{ width: "100%", padding: 11, border: 0, background: "transparent", color: "var(--arp-text-main)" }}/></label>
    <p className={styles.subtitle}>These are topic overlaps, not citation links. Citation data is not available in the current frontend.</p>
    {!papersReady || !projectsReady ? <p role="status">Loading research graph…</p> : filtered.length === 0 ? <section className="arpis-glass-card" style={{ padding: 24 }}><FiGitBranch/><h2>{papers.length ? "No matching papers" : "No papers to map"}</h2><p>{papers.length ? "Try a different title or topic." : "Add papers to a project to build a topic map."}</p><Link href={projects[0] ? `/projects/${projects[0].id}/papers/upload` : "/projects"}>{projects[0] ? "Upload a paper" : "Open projects"}</Link></section> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: 12 }}>
      <section className="arpis-glass-card" style={{ padding: 18 }}><h2 style={{ fontSize: "1rem" }}>Paper nodes</h2>{filtered.map((paper) => <article key={paper.id} style={{ padding: "12px 0", borderTop: "1px solid var(--arp-border-subtle)" }}><Link href={`/projects/${paper.projectId}/papers/${paper.id}`} style={{ fontWeight: 700, fontSize: ".82rem" }}>{paper.title}</Link><small style={{ display: "block", marginTop: 5, color: "var(--arp-text-muted)" }}>{projects.find((project) => project.id === paper.projectId)?.name} · {terms(paper).join(" · ") || "No keywords recorded"}</small></article>)}</section>
      <section className="arpis-glass-card" style={{ padding: 18 }}><h2 style={{ fontSize: "1rem" }}>Shared-topic links ({relations.length})</h2>{relations.length ? relations.map(({ paper, other, shared }) => <article key={`${paper.id}-${other.id}`} style={{ padding: "12px 0", borderTop: "1px solid var(--arp-border-subtle)" }}><Link href={`/projects/${paper.projectId}/papers/${paper.id}`} style={{ fontSize: ".78rem" }}>{paper.title}</Link><span aria-hidden="true"> ↔ </span><Link href={`/projects/${other.projectId}/papers/${other.id}`} style={{ fontSize: ".78rem" }}>{other.title}</Link><small style={{ display: "block", marginTop: 5, color: "var(--arp-accent)" }}>Shared topics: {shared.join(", ")}</small></article>) : <p style={{ color: "var(--arp-text-muted)", fontSize: ".78rem" }}>No shared topics found. Add keywords or tags to reveal relationships.</p>}</section>
    </div>}
  </main>;
}

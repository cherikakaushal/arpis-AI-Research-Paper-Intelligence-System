"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowUpRight, FiMessageSquare, FiSearch } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import styles from "./chat.module.css";

export default function ResearchChatPage() {
  const { projects, ready: projectsReady } = useProjects();
  const { papers, ready: papersReady } = usePapers();
  const [query, setQuery] = useState("");
  const filtered = projects.filter((project) => `${project.name} ${project.description} ${project.domain}`.toLowerCase().includes(query.toLowerCase()));
  const ready = projectsReady && papersReady;

  return <main className={styles.wrapper}>
    <header className={styles.header}><div className={styles.orbWrap}><div className={styles.orbCore}/><div className={styles.orbGlow}/><div className={styles.orbHalo}/></div><div className={styles.headerText}><h1 className={styles.title}>Research Chat</h1><p className={styles.subtitle}>Choose a project to search its saved papers and notes.</p></div></header>
    <label style={{ display: "flex", alignItems: "center", gap: 9, maxWidth: 560, padding: "0 12px", border: "1px solid var(--arp-border-subtle)", borderRadius: 9 }}><FiSearch/><input aria-label="Search projects" placeholder="Search projects" value={query} onChange={(event) => setQuery(event.target.value)} style={{ width: "100%", padding: 12, border: 0, background: "transparent", color: "var(--arp-text-main)" }}/></label>
    {!ready ? <p role="status">Loading projects…</p> : filtered.length === 0 ? <p style={{ color: "var(--arp-text-muted)" }}>{projects.length ? "No projects match this search." : "Create a project before starting a project conversation."}</p> : <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 12, marginTop: 18 }}>{filtered.map((project) => <Link key={project.id} href={`/projects/${project.id}/chat`} className="arpis-glass-card" style={{ display: "grid", gridTemplateColumns: "42px minmax(0,1fr) auto", alignItems: "center", gap: 12, padding: 16 }}><span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 9, background: `${project.color}20`, color: project.color }}><FiMessageSquare/></span><span><strong>{project.name}</strong><small style={{ display: "block", marginTop: 4, color: "var(--arp-text-muted)" }}>{papers.filter((paper) => paper.projectId === project.id).length} papers · project-local search</small></span><FiArrowUpRight/></Link>)}</section>}
    <p className={styles.subtitle} style={{ marginTop: 22 }}>Project chat searches saved paper titles, abstracts, and keywords locally. It does not call an AI service.</p>
    {projects.length === 0 && ready && <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "var(--arp-accent)" }}>Open projects <FiArrowUpRight/></Link>}
  </main>;
}

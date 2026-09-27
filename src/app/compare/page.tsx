"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSave } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import styles from "./compare.module.css";

export default function ComparePage() {
  const { projects, ready: projectsReady } = useProjects();
  const { papers, ready: papersReady } = usePapers();
  const { saveComparison } = useResearch();
  const [projectId, setProjectId] = useState("");
  const [paperAId, setPaperAId] = useState("");
  const [paperBId, setPaperBId] = useState("");
  const [message, setMessage] = useState("");
  const selectedProjectId = projects.some((project) => project.id === projectId) ? projectId : projects[0]?.id ?? "";
  const projectPapers = papers.filter((paper) => paper.projectId === selectedProjectId);
  const paperA = projectPapers.find((paper) => paper.id === paperAId) ?? projectPapers[0];
  const paperB = projectPapers.find((paper) => paper.id === paperBId && paper.id !== paperA?.id) ?? projectPapers.find((paper) => paper.id !== paperA?.id);
  const termsA = [...new Set([...(paperA?.tags ?? []), ...(paperA?.keywords ?? [])].map((term) => term.toLowerCase()))];
  const termsB = [...new Set([...(paperB?.tags ?? []), ...(paperB?.keywords ?? [])].map((term) => term.toLowerCase()))];
  const sharedTerms = termsA.filter((term) => termsB.includes(term));
  const rows = paperA && paperB ? [
    ["Authors", paperA.authors.join(", ") || "Not recorded", paperB.authors.join(", ") || "Not recorded"],
    ["Year", String(paperA.year), String(paperB.year)],
    ["Venue", paperA.journal, paperB.journal],
    ["Reading status", paperA.status, paperB.status],
    ["Keywords", paperA.keywords.join(", ") || "Not recorded", paperB.keywords.join(", ") || "Not recorded"],
    ["Abstract", paperA.abstract || "No abstract saved.", paperB.abstract || "No abstract saved."],
  ] : [];
  const save = () => {
    if (!paperA || !paperB) return;
    saveComparison(selectedProjectId, [paperA.id, paperB.id]);
    setMessage("Comparison saved in this project.");
  };

  if (!projectsReady || !papersReady) return <main className={styles.page}><p>Loading saved papers…</p></main>;
  return <main className={styles.page}>
    <header><span>Project comparison</span><h1>Compare Papers</h1><p>Compare metadata and abstracts saved to a project.</p></header>
    {projects.length === 0 ? <section className={styles.empty}><h2>Create a project to begin</h2><Link href="/projects">Open projects</Link></section> : <>
      <section className={styles.controls}>
        <label>Project<select value={selectedProjectId} onChange={(event) => { setProjectId(event.target.value); setPaperAId(""); setPaperBId(""); setMessage(""); }}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        {projectPapers.length < 2 ? <p className={styles.emptyMessage}>This project needs at least two papers to compare. <Link href={`/projects/${selectedProjectId}/papers/upload`}>Add a paper</Link></p> : <div className={styles.selectors}><label>Paper A<select value={paperA?.id ?? ""} onChange={(event) => { setPaperAId(event.target.value); setMessage(""); }}>{projectPapers.map((paper) => <option value={paper.id} key={paper.id}>{paper.title}</option>)}</select></label><label>Paper B<select value={paperB?.id ?? ""} onChange={(event) => { setPaperBId(event.target.value); setMessage(""); }}>{projectPapers.filter((paper) => paper.id !== paperA?.id).map((paper) => <option value={paper.id} key={paper.id}>{paper.title}</option>)}</select></label></div>}
      </section>
      {paperA && paperB && <><section className={styles.paperCards}><article className={styles.paperCard}><h2>{paperA.title}</h2><p>{paperA.authors.join(", ") || "Author not recorded"} · {paperA.year}</p><Link href={`/projects/${selectedProjectId}/papers/${paperA.id}`}>Open paper</Link></article><article className={styles.paperCard}><h2>{paperB.title}</h2><p>{paperB.authors.join(", ") || "Author not recorded"} · {paperB.year}</p><Link href={`/projects/${selectedProjectId}/papers/${paperB.id}`}>Open paper</Link></article></section>
        <section className={styles.comparison}><h2>Shared saved keywords</h2><p>{sharedTerms.length ? sharedTerms.join(" · ") : "No matching keywords or tags were found."}</p><div className={styles.rows}>{rows.map(([label, valueA, valueB]) => <article key={label}><strong>{label}</strong><p>{valueA}</p><p>{valueB}</p></article>)}</div><p className={styles.disclaimer}>This view compares saved metadata only. It does not infer scientific conclusions.</p><button type="button" onClick={save}><FiSave/> Save comparison</button>{message && <p role="status" className={styles.feedback}>{message}</p>}</section></>}
    </>}
  </main>;
}

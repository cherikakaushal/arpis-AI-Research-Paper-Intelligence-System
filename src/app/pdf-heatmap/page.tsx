"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePapers } from "@/components/papers/PaperProvider";
import styles from "./heatmap.module.css";

export default function PDFHeatmapPage() {
  const { papers, ready } = usePapers();
  const [paperId, setPaperId] = useState("");
  const [keyword, setKeyword] = useState("");
  const paper = papers.find((item) => item.id === paperId) ?? papers[0];
  const focus = keyword || paper?.keywords[0] || paper?.tags[0] || "";
  const sentences = useMemo(() => (paper?.abstract ?? "").split(/(?<=[.!?])\s+/).map((text) => text.trim()).filter(Boolean), [paper]);
  const matches = sentences.filter((sentence) => focus && sentence.toLowerCase().includes(focus.toLowerCase())).length;

  return <main className={styles.wrapper} style={{ padding: "20px", maxWidth: 1100, margin: "0 auto" }}>
    <h1 className={styles.title}>PDF Heatmap</h1>
    <p className={styles.subtitle}>Inspect topic matches in a paper’s saved abstract. Highlighting uses literal keyword matching, not model-generated importance scores.</p>
    {!ready ? <p role="status">Loading papers…</p> : papers.length === 0 ? <section className="arpis-glass-card" style={{ padding: 22 }}><h2>No saved papers</h2><p>Add a paper to a project to inspect its abstract.</p><Link href="/upload">Upload paper</Link></section> : <>
      <div className={styles.toggleRow}><label>Paper<select aria-label="Select paper" value={paper?.id ?? ""} onChange={(event) => { setPaperId(event.target.value); setKeyword(""); }}>{papers.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>Focus keyword<select aria-label="Select focus keyword" value={focus} onChange={(event) => setKeyword(event.target.value)}><option value="">No keyword filter</option>{[...new Set([...(paper?.keywords ?? []), ...(paper?.tags ?? [])])].map((term) => <option key={term} value={term}>{term}</option>)}</select></label></div>
      {paper && <section className={styles.viewer}><article className={styles.pdfPane}><header><h2>{paper.title}</h2><p>{paper.journal} · {paper.year} · {sentences.length} abstract sentences</p></header>{sentences.length ? sentences.map((sentence, index) => { const matched = Boolean(focus) && sentence.toLowerCase().includes(focus.toLowerCase()); return <p key={`${paper.id}-${index}`} className={styles.line} style={{ background: matched ? "rgba(255, 183, 77, .22)" : "transparent", borderLeft: matched ? "3px solid #ffb74d" : "3px solid transparent" }}>{sentence}</p>; }) : <p>No abstract text is saved for this paper.</p>}<small>{focus ? `${matches} of ${sentences.length} sentences contain “${focus}”.` : "Choose a keyword to highlight matching sentences."}</small></article><aside><Link href={`/projects/${paper.projectId}/papers/${paper.id}/reader`}>Open saved PDF</Link><p>Matching text is drawn from the stored abstract; uploaded PDF text is not extracted in this browser.</p></aside></section>}
    </>}
  </main>;
}

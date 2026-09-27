"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FiBookOpen, FiDownload, FiEdit3, FiLayers, FiMessageSquare, FiStar, FiTrash2 } from "react-icons/fi";
import { statuses, usePapers } from "@/components/papers/PaperProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import styles from "./paper.module.css";

export default function PaperDetails() {
  const { id, paperId } = useParams<{ id: string; paperId: string }>();
  const router = useRouter();
  const { getPaper, updatePaper, deletePaper, ready } = usePapers();
  const { deletePaperData } = useResearch();
  const paper = getPaper(paperId);
  const [feedback, setFeedback] = useState("");
  if (!ready) return <main className={styles.page}>Loading paper…</main>;
  if (!paper || paper.projectId !== id) return <main className={styles.page}><h1>Paper not found</h1><Link href={`/projects/${id}/papers`}>Back to library</Link></main>;

  const authors = paper.authors.join(", ") || "Unknown author";
  const firstAuthor = paper.authors[0]?.split(" ").at(-1)?.toLowerCase().replace(/[^a-z0-9]/g, "") || "paper";
  const citations: Record<string, string> = {
    APA: `${authors} (${paper.year}). ${paper.title}. ${paper.journal}.`,
    IEEE: `${authors}, “${paper.title},” ${paper.journal}, ${paper.year}.`,
    MLA: `${authors}. “${paper.title}.” ${paper.journal}, ${paper.year}.`,
    BibTeX: `@article{${firstAuthor}${paper.year},\n  title={${paper.title}},\n  author={${authors}},\n  journal={${paper.journal}},\n  year={${paper.year}}\n}`,
  };
  const copy = async (format: string, citation: string) => {
    try {
      await navigator.clipboard.writeText(citation);
      setFeedback(`${format} citation copied.`);
    } catch {
      setFeedback("Clipboard access was denied. Select and copy the citation text manually.");
    }
  };
  const downloadBibtex = () => {
    const blob = new Blob([citations.BibTeX], { type: "application/x-bibtex" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `${paper.id}.bib`; link.click();
    URL.revokeObjectURL(url);
    setFeedback("BibTeX citation downloaded.");
  };
  const remove = () => {
    if (!window.confirm(`Delete “${paper.title}” and its saved PDF from this browser?`)) return;
    deletePaper(paper.id);
    deletePaperData(paper.id);
    router.push(`/projects/${id}/papers`);
  };

  return <main className={styles.page}>
    <Link className={styles.back} href={`/projects/${id}/papers`}>← Paper Library</Link>
    <header><div className={styles.kicker}>{paper.journal} · {paper.year}</div><div className={styles.title}><h1>{paper.title}</h1><button className={paper.favorite ? styles.favorite : ""} onClick={() => updatePaper(paper.id, { favorite: !paper.favorite })} aria-label={paper.favorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={paper.favorite}><FiStar/></button></div><p>{authors}</p><div className={styles.tags}>{paper.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></header>
    <div className={styles.layout}><div>
      <section className={styles.card}><h2>Abstract</h2><p>{paper.abstract || "No abstract was provided for this paper."}</p></section>
      <section className={styles.card}><h2>Metadata</h2><dl><div><dt>Journal</dt><dd>{paper.journal}</dd></div><div><dt>Year</dt><dd>{paper.year}</dd></div><div><dt>Pages</dt><dd>{paper.pages}</dd></div><div><dt>Uploaded</dt><dd>{new Date(paper.uploadedAt).toLocaleDateString()}</dd></div><div><dt>Keywords</dt><dd>{paper.keywords.join(", ") || "Not recorded"}</dd></div><div><dt>Reading status</dt><dd><select aria-label="Reading status" value={paper.status} onChange={(event) => updatePaper(paper.id, { status: event.target.value as typeof paper.status })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></dd></div></dl></section>
      <section className={styles.card}><h2>Citations</h2>{Object.entries(citations).map(([format, citation]) => <div className={styles.citation} key={format}><div><strong>{format}</strong><p>{citation}</p></div><button type="button" onClick={() => void copy(format, citation)}>Copy</button></div>)}<button type="button" onClick={downloadBibtex}><FiDownload/> Download BibTeX</button>{feedback && <p className={styles.feedback} role="status">{feedback}</p>}</section>
    </div><aside className={styles.side}><div className={styles.card}><h2>Paper actions</h2><Link href={`/projects/${id}/papers/${paperId}/reader`}><FiBookOpen/> Open reader</Link><Link href={`/projects/${id}/papers/${paperId}/notes`}><FiEdit3/> Edit paper notes</Link><Link href={`/projects/${id}/chat`}><FiMessageSquare/> Search in project</Link><Link href={`/projects/${id}/compare`}><FiLayers/> Compare papers</Link><button type="button" className={styles.delete} onClick={remove}><FiTrash2/> Delete paper</button></div></aside></div>
  </main>;
}

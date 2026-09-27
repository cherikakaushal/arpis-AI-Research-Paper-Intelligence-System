"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { paperId } from "@/lib/papers";
import styles from "./fetch.module.css";

type ImportedPaper = { title: string; authors: string; year: number; abstract: string; journal: string; keywords: string };
type CrossrefWork = {
  title?: string[];
  author?: { given?: string; family?: string }[];
  published?: { "date-parts"?: number[][] };
  abstract?: string;
  "container-title"?: string[];
  subject?: string[];
  page?: string;
};

function normalizeIdentifier(value: string) {
  const doi = value.match(/10\.\d{4,9}\/[^\s?#]+/i)?.[0]?.replace(/[.,;]+$/, "");
  if (doi) return { kind: "doi" as const, id: doi };
  const arxiv = value.match(/(?:abs\/|pdf\/)?((?:\d{4}\.\d{4,5}|[a-z-]+\/\d{7})(?:v\d+)?)/i)?.[1];
  if (arxiv) return { kind: "arxiv" as const, id: arxiv };
  return null;
}

export default function FetchPage() {
  const { projects, ready } = useProjects();
  const { addPaper } = usePapers();
  const [identifier, setIdentifier] = useState("");
  const [projectId, setProjectId] = useState("");
  const [paper, setPaper] = useState<ImportedPaper | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const requestedProject = new URLSearchParams(window.location.search).get("projectId");
    if (requestedProject && projects.some((project) => project.id === requestedProject)) setProjectId(requestedProject);
    else if (projects[0]) setProjectId((current) => current || projects[0].id);
  }, [projects]);

  const lookup = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = normalizeIdentifier(identifier.trim());
    setError(""); setMessage(""); setPaper(null);
    if (!parsed) { setError("Enter a DOI or arXiv identifier or URL. Other publishers can be added by entering metadata manually in the project upload form."); return; }
    setLoading(true);
    try {
      if (parsed.kind === "doi") {
        const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(parsed.id)}`, { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Crossref returned ${response.status}. Check the DOI and your network connection.`);
        const result = await response.json() as { message?: CrossrefWork };
        const work = result.message;
        if (!work?.title?.[0]) throw new Error("Crossref did not return a paper title for this DOI.");
        setPaper({ title: work.title[0], authors: (work.author ?? []).map((author) => [author.given, author.family].filter(Boolean).join(" ")).join(", "), year: work.published?.["date-parts"]?.[0]?.[0] ?? new Date().getFullYear(), abstract: (work.abstract ?? "").replace(/<[^>]*>/g, " ").trim(), journal: work["container-title"]?.[0] ?? "Unpublished", keywords: (work.subject ?? []).join(", ") });
      } else {
        const response = await fetch(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(parsed.id)}`);
        if (!response.ok) throw new Error(`arXiv returned ${response.status}. Check the identifier and your network connection.`);
        const xml = new DOMParser().parseFromString(await response.text(), "application/xml");
        if (xml.querySelector("parsererror")) throw new Error("Could not read the metadata returned by arXiv.");
        const entry = xml.querySelector("entry");
        const title = entry?.querySelector("title")?.textContent?.replace(/\s+/g, " ").trim();
        if (!entry || !title) throw new Error("arXiv did not find a paper with that identifier.");
        setPaper({ title, authors: Array.from(entry.querySelectorAll("author name")).map((node) => node.textContent?.trim()).filter(Boolean).join(", "), year: Number(entry.querySelector("published")?.textContent?.slice(0, 4)) || new Date().getFullYear(), abstract: entry.querySelector("summary")?.textContent?.trim() ?? "", journal: "arXiv", keywords: Array.from(entry.querySelectorAll("category")).map((node) => node.getAttribute("term")).filter(Boolean).join(", ") });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Metadata lookup failed. Try again or enter the metadata manually in a project.");
    } finally {
      setLoading(false);
    }
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!paper || !projectId) { setError("Choose a project before saving this paper."); return; }
    if (!paper.title.trim()) { setError("Paper title is required."); return; }
    setSaving(true); setError("");
    try {
      addPaper({ id: paperId(paper.title), projectId, title: paper.title.trim(), authors: paper.authors.split(",").map((author) => author.trim()).filter(Boolean), year: paper.year, abstract: paper.abstract.trim(), keywords: paper.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean), journal: paper.journal.trim() || "Unpublished", pages: 1, uploadedAt: new Date().toISOString(), status: "Unread", tags: [], favorite: false });
      setMessage("Paper metadata saved to the selected project. No PDF was downloaded.");
      setPaper(null); setIdentifier("");
    } catch {
      setError("Could not save the paper. Check browser storage and try again.");
    } finally {
      setSaving(false);
    }
  };

  return <main className={styles.page}>
    <header><span>Paper Library</span><h1>Find a research paper</h1><p>Look up DOI or arXiv metadata, review the result, and save it to a project.</p></header>
    <form className={styles.lookup} onSubmit={lookup}><label>DOI or arXiv URL / identifier<input value={identifier} onChange={(event) => setIdentifier(event.target.value)} required placeholder="10.1038/... or arXiv:1706.03762"/></label><button type="submit" disabled={loading}>{loading ? "Looking up…" : "Look up metadata"}</button></form>
    {!ready ? <p role="status">Loading projects…</p> : projects.length === 0 ? <section className={styles.empty}><p>Create a project before importing paper metadata.</p><Link href="/projects">Open projects</Link></section> : null}
    {error && <p className={styles.error} role="alert">{error}</p>}{message && <p className={styles.success} role="status">{message}</p>}
    {paper && <form className={styles.paperForm} onSubmit={save}><h2>Review paper metadata</h2><p>Verify the source fields before adding this record. PDF files are not fetched by this importer.</p><label>Save to project<select value={projectId} onChange={(event) => setProjectId(event.target.value)} required>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label><label>Title<input value={paper.title} onChange={(event) => setPaper({ ...paper, title: event.target.value })} required/></label><label>Authors<input value={paper.authors} onChange={(event) => setPaper({ ...paper, authors: event.target.value })}/></label><div className={styles.fields}><label>Year<input type="number" min="1600" max={new Date().getFullYear() + 1} value={paper.year} onChange={(event) => setPaper({ ...paper, year: Number(event.target.value) })}/></label><label>Journal / venue<input value={paper.journal} onChange={(event) => setPaper({ ...paper, journal: event.target.value })}/></label></div><label>Keywords<input value={paper.keywords} onChange={(event) => setPaper({ ...paper, keywords: event.target.value })}/></label><label>Abstract<textarea rows={7} value={paper.abstract} onChange={(event) => setPaper({ ...paper, abstract: event.target.value })}/></label><button type="submit" disabled={saving}>{saving ? "Saving…" : "Save paper metadata"}</button></form>}
  </main>;
}

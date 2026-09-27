"use client";

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FiBookOpen, FiGlobe, FiHash, FiUploadCloud } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { paperId } from "@/lib/papers";
import { savePdf } from "@/lib/pdfStore";
import styles from "./upload.module.css";

export default function UploadPaper() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addPaper } = usePapers();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [journal, setJournal] = useState("");
  const [abstract, setAbstract] = useState("");
  const [keywords, setKeywords] = useState("");
  const [pages, setPages] = useState(1);
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const choose = (value: File | null) => {
    if (!value) return;
    if (value.type !== "application/pdf" && !value.name.toLowerCase().endsWith(".pdf")) {
      setError("Choose a PDF file.");
      return;
    }
    setFile(value);
    setError("");
    setTitle((current) => current || value.name.replace(/\.pdf$/i, ""));
  };
  const change = (event: ChangeEvent<HTMLInputElement>) => choose(event.target.files?.[0] ?? null);
  const drop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    choose(event.dataTransfer.files[0] ?? null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file || !title.trim()) {
      setError("Select a PDF and enter a paper title.");
      return;
    }
    setSaving(true);
    setError("");
    const idValue = paperId(title);
    try {
      await savePdf(idValue, file);
      addPaper({
        id: idValue,
        projectId: id,
        title: title.trim(),
        authors: authors.split(",").map((author) => author.trim()).filter(Boolean),
        year,
        abstract: abstract.trim(),
        keywords: keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
        journal: journal.trim() || "Unpublished",
        pages,
        uploadedAt: new Date().toISOString(),
        status: "Unread",
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        favorite: false,
        fileName: file.name,
      });
      router.push(`/projects/${id}/papers/${idValue}`);
    } catch (cause) {
      setError(cause instanceof Error ? `${cause.message} Check available browser storage and try again.` : "Could not save this paper in browser storage.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <header>
        <span>Paper Library</span>
        <h1>Upload Research Paper</h1>
        <p>Add a PDF and its metadata to this project.</p>
      </header>
      <form onSubmit={submit}>
        <section className={styles.drop} onDragOver={(event) => event.preventDefault()} onDrop={drop} onClick={() => input.current?.click()} aria-label="Choose or drop a PDF">
          <input ref={input} type="file" accept="application/pdf,.pdf" onChange={change}/>
          <FiUploadCloud/><h2>{file ? file.name : "Drop PDF here"}</h2>
          <p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · stored in this browser` : "or choose a file from your computer"}</p>
          <button type="button" onClick={(event) => { event.stopPropagation(); input.current?.click(); }}>Choose File</button>
        </section>
        <div className={styles.imports}>
          <Link href={`/fetch?projectId=${encodeURIComponent(id)}&source=arxiv`}><FiBookOpen/><span>Find an arXiv paper<small>Import by identifier</small></span></Link>
          <Link href={`/fetch?projectId=${encodeURIComponent(id)}&source=doi`}><FiHash/><span>Find by DOI<small>Import publisher metadata</small></span></Link>
          <Link href={`/fetch?projectId=${encodeURIComponent(id)}&source=url`}><FiGlobe/><span>Import from URL<small>Review metadata manually</small></span></Link>
        </div>
        <section className={styles.metadata}>
          <h2>Paper metadata</h2>
          <div className={styles.fields}>
            <label className={styles.wide}>Title *<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={300}/></label>
            <label className={styles.wide}>Authors<input value={authors} onChange={(event) => setAuthors(event.target.value)} placeholder="Separate authors with commas"/></label>
            <label>Year<input type="number" min="1600" max={new Date().getFullYear() + 1} value={year} onChange={(event) => setYear(Number(event.target.value))} required/></label>
            <label>Journal / venue<input value={journal} onChange={(event) => setJournal(event.target.value)}/></label>
            <label>Pages<input type="number" min="1" value={pages} onChange={(event) => setPages(Math.max(1, Number(event.target.value)))} required/></label>
            <label className={styles.wide}>Abstract<textarea rows={5} value={abstract} onChange={(event) => setAbstract(event.target.value)}/></label>
            <label>Keywords<input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="Separate keywords with commas"/></label>
            <label>Tags<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Separate tags with commas"/></label>
          </div>
        </section>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        <footer><Link href={`/projects/${id}/papers`}>Cancel</Link><button type="submit" disabled={saving || !file}>{saving ? "Saving paper…" : "Save Paper"}</button></footer>
      </form>
    </main>
  );
}

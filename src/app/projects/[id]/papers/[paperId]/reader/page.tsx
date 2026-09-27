"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FiBookOpen, FiHelpCircle, FiLink, FiMessageSquare } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { loadPdfUrl } from "@/lib/pdfStore";
import styles from "./reader.module.css";

export default function Reader() {
  const { id, paperId } = useParams<{ id: string; paperId: string }>();
  const { getPaper, ready } = usePapers();
  const paper = getPaper(paperId);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    loadPdfUrl(paperId).then((savedUrl) => {
      if (!active) {
        if (savedUrl) URL.revokeObjectURL(savedUrl);
        return;
      }
      objectUrl = savedUrl;
      setUrl(savedUrl);
    }).catch((cause: unknown) => {
      if (!active) return;
      setUrl(null);
      setError(cause instanceof Error ? cause.message : "Unable to open the saved PDF.");
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [paperId]);

  if (!ready) return <main className={styles.reader}>Loading paper…</main>;
  if (!paper || paper.projectId !== id) return <main className={styles.reader}><h1>Paper not found</h1><Link href={`/projects/${id}/papers`}>Back to library</Link></main>;

  return <main className={styles.reader}>
    <header><Link href={`/projects/${id}/papers/${paperId}`}>← Details</Link><div><strong>{paper.title}</strong><span>{paper.status}</span></div><Link href={`/projects/${id}/papers/${paperId}/notes`}>Notes</Link></header>
    <div className={styles.split}>
      <section className={styles.pdf}>
        {url ? <iframe src={url} title={paper.title}/> : <div><FiBookOpen/><h2>PDF preview unavailable</h2><p>{error || "This paper has metadata but no PDF file saved in this browser."}</p><Link href={`/projects/${id}/papers/upload`}>Upload PDF</Link></div>}
      </section>
      <aside><span>Paper workspace</span><h2>Work with this source</h2><p>Open the project tools to review saved metadata, capture notes, or search across local paper text.</p>
        <Link href={`/projects/${id}/papers/${paperId}`}><FiBookOpen/> View paper details</Link>
        <Link href={`/projects/${id}/papers/${paperId}/notes`}><FiHelpCircle/> Write paper notes</Link>
        <Link href={`/projects/${id}/graph`}><FiLink/> Explore shared topics</Link>
        <Link href={`/projects/${id}/chat`}><FiMessageSquare/> Search project papers</Link>
      </aside>
    </div>
  </main>;
}


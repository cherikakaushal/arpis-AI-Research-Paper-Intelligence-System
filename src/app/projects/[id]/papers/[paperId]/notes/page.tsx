"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { usePapers } from "@/components/papers/PaperProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import styles from "./notes.module.css";

const template = "# Today's findings\n\n## Summary\n\n## Questions\n\n## Future work\n";

export default function PaperNotes() {
  const { id, paperId } = useParams<{ id: string; paperId: string }>();
  const { getPaper, ready: papersReady } = usePapers();
  const { notes, ready: researchReady } = useResearch();
  const paper = getPaper(paperId);
  const note = notes.find((item) => item.paperId === paperId);
  if (!papersReady || !researchReady) return <main className={styles.page}>Loading notes…</main>;
  if (!paper || paper.projectId !== id) return <main className={styles.page}><h1>Paper not found</h1><Link href={`/projects/${id}/papers`}>Back to library</Link></main>;
  return <PaperNotesEditor key={paperId} projectId={id} paperId={paperId} paperTitle={paper.title} initialContent={note?.content ?? template} noteId={note?.id ?? `paper-${paperId}`}/>;
}

function PaperNotesEditor({ projectId, paperId, paperTitle, initialContent, noteId }: { projectId: string; paperId: string; paperTitle: string; initialContent: string; noteId: string }) {
  const { saveNote } = useResearch();
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(true);
  const [feedback, setFeedback] = useState("");
  const save = () => {
    saveNote({ id: noteId, projectId, paperId, title: `${paperTitle} notes`, content, updatedAt: new Date().toISOString() });
    setSaved(true); setFeedback("Notes saved on this device.");
  };
  return <main className={styles.page}><header><div><Link href={`/projects/${projectId}/papers/${paperId}`}>← Paper details</Link><h1>Notes</h1><p>{paperTitle}</p></div><button type="button" onClick={save} disabled={saved}>{saved ? "Saved" : "Save notes"}</button></header><div className={styles.editor}><section><div>MARKDOWN</div><textarea aria-label="Paper notes in Markdown" value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); setFeedback(""); }} spellCheck/></section><section><div>PREVIEW</div><article>{content.split("\n").map((line, index) => line.startsWith("# ") ? <h1 key={index}>{line.slice(2)}</h1> : line.startsWith("## ") ? <h2 key={index}>{line.slice(3)}</h2> : line.startsWith("- ") ? <li key={index}>{line.slice(2) || "Add a note…"}</li> : <p key={index}>{line || " "}</p>)}</article></section></div>{feedback && <p role="status" className={styles.feedback}>{feedback}</p>}</main>;
}

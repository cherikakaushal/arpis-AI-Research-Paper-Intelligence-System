"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiDownload, FiPlus, FiSave, FiSearch, FiTrash2 } from "react-icons/fi";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import { Project } from "@/lib/projects";
import styles from "./ProjectTools.module.css";

export type Mode = "AI Chat" | "Compare" | "Knowledge Graph" | "Notes" | "Literature Review" | "Exports" | "Settings";

export default function ProjectTools({ projectId, mode }: { projectId: string; mode: Mode }) {
  const { getProject, ready: projectsReady } = useProjects();
  const { getProjectPapers, papers, ready: papersReady } = usePapers();
  const project = getProject(projectId);
  if (!projectsReady || !papersReady) return <p className={styles.notice}>Loading project data…</p>;
  if (!project) return <p className={styles.notice}>This project could not be found. <Link href="/projects">Return to projects</Link></p>;

  const projectPapers = getProjectPapers(projectId);
  if (mode === "Notes") return <NotesTool projectId={projectId} papers={projectPapers} />;
  if (mode === "AI Chat") return <ChatTool projectId={projectId} papers={projectPapers} />;
  if (mode === "Compare") return <CompareTool projectId={projectId} papers={projectPapers} />;
  if (mode === "Knowledge Graph") return <GraphTool papers={projectPapers} />;
  if (mode === "Literature Review") return <ReviewTool projectId={projectId} project={project} papers={projectPapers} />;
  if (mode === "Exports") return <ExportsTool project={project} papers={projectPapers} />;
  return <SettingsTool project={project} papers={papers.filter((paper) => paper.projectId === projectId)} />;
}

function NotesTool({ projectId, papers }: { projectId: string; papers: ReturnType<typeof usePapers>["papers"] }) {
  const { notes, ready, saveNote, deleteNote } = useResearch();
  const projectNotes = notes.filter((note) => note.projectId === projectId);
  const [selectedId, setSelectedId] = useState("");
  const selected = projectNotes.find((note) => note.id === selectedId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [paperId, setPaperId] = useState("");
  const [message, setMessage] = useState("");
  const startNew = () => { setSelectedId(""); setTitle(""); setContent(""); setPaperId(""); setMessage(""); };
  const edit = (id: string) => {
    const note = projectNotes.find((item) => item.id === id);
    if (!note) return;
    setSelectedId(note.id); setTitle(note.title); setContent(note.content); setPaperId(note.paperId ?? ""); setMessage("");
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) { setMessage("Add a title and note content before saving."); return; }
    saveNote({ id: selectedId || crypto.randomUUID(), projectId, paperId: paperId || undefined, title: title.trim(), content: content.trim(), updatedAt: new Date().toISOString() });
    setMessage("Note saved on this device.");
  };
  if (!ready) return <p className={styles.notice}>Loading notes…</p>;
  return <div className={styles.columns}>
    <section className={styles.panel}>
      <div className={styles.panelHeader}><h2>Project notes</h2><button type="button" onClick={startNew} aria-label="Create note"><FiPlus/></button></div>
      {projectNotes.length === 0 ? <p className={styles.empty}>No notes yet. Create a note to capture an insight.</p> : <ul className={styles.recordList}>{projectNotes.map((note) => <li key={note.id}><button type="button" className={selectedId === note.id ? styles.selected : ""} onClick={() => edit(note.id)}><strong>{note.title}</strong><small>{new Date(note.updatedAt).toLocaleDateString()} {note.paperId ? `· ${papers.find((paper) => paper.id === note.paperId)?.title ?? "Paper note"}` : "· Project note"}</small></button><button type="button" className={styles.iconButton} aria-label={`Delete ${note.title}`} onClick={() => { if (window.confirm(`Delete “${note.title}”?`)) { deleteNote(note.id); if (selectedId === note.id) startNew(); } }}><FiTrash2/></button></li>)}</ul>}
    </section>
    <form className={styles.panel} onSubmit={submit}>
      <div className={styles.panelHeader}><h2>{selected ? "Edit note" : "New note"}</h2><span className={styles.localTag}>Saved locally</span></div>
      <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required/></label>
      <label>Related paper<select value={paperId} onChange={(event) => setPaperId(event.target.value)}><option value="">Project-wide</option>{papers.map((paper) => <option key={paper.id} value={paper.id}>{paper.title}</option>)}</select></label>
      <label>Note<textarea value={content} onChange={(event) => setContent(event.target.value)} rows={12} required placeholder="Capture a finding, question, or connection…"/></label>
      {message && <p className={styles.feedback} role="status">{message}</p>}
      <button className={styles.primary} type="submit"><FiSave/> Save note</button>
    </form>
  </div>;
}

function ChatTool({ projectId, papers }: { projectId: string; papers: ReturnType<typeof usePapers>["papers"] }) {
  const { conversations, ready, createConversation, saveConversation, deleteConversation } = useResearch();
  const threads = conversations.filter((conversation) => conversation.projectId === projectId);
  const [activeId, setActiveId] = useState("");
  const active = threads.find((thread) => thread.id === activeId);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\W+/).filter((term) => term.length > 2);
    if (!terms.length) return [];
    return papers.map((paper) => {
      const source = `${paper.title} ${paper.abstract} ${paper.keywords.join(" ")} ${paper.tags.join(" ")}`.toLowerCase();
      return { paper, score: terms.reduce((score, term) => score + (source.includes(term) ? 1 : 0), 0) };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  }, [papers, query]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = question.trim();
    if (!text) { setError("Enter a question to search this project’s papers."); return; }
    const matching = papers.map((paper) => {
      const haystack = `${paper.title} ${paper.abstract} ${paper.keywords.join(" ")}`.toLowerCase();
      const terms = text.toLowerCase().split(/\W+/).filter((term) => term.length > 2);
      return { paper, score: terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0) };
    }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
    const answer = matching.length
      ? `Local paper search found ${matching.length} relevant source${matching.length === 1 ? "" : "s"}. This is a keyword match, not an AI-generated answer.\n\n${matching.map(({ paper }) => `• ${paper.title}: ${(paper.abstract || "No abstract saved.").slice(0, 340)}`).join("\n\n")}`
      : "No matching terms were found in the saved titles, abstracts, and keywords. Add paper metadata or try different search terms. This local search does not generate AI answers.";
    const now = new Date().toISOString();
    const thread = active ?? createConversation(projectId, text.slice(0, 60));
    saveConversation({ ...thread, title: thread.title || text.slice(0, 60), messages: [...thread.messages, { id: crypto.randomUUID(), role: "user", content: text, createdAt: now }, { id: crypto.randomUUID(), role: "assistant", content: answer, createdAt: now }], updatedAt: now });
    setActiveId(thread.id); setQuestion(""); setError("");
  };
  if (!ready) return <p className={styles.notice}>Loading conversations…</p>;
  return <div className={styles.columns}>
    <section className={styles.panel}>
      <div className={styles.panelHeader}><h2>Conversations</h2><button type="button" onClick={() => { setActiveId(""); setQuestion(""); }} aria-label="Start a new conversation"><FiPlus/></button></div>
      {threads.length ? <ul className={styles.threadList}>{threads.map((thread) => <li key={thread.id}><button type="button" className={activeId === thread.id ? styles.selected : ""} onClick={() => setActiveId(thread.id)}>{thread.title}</button><button type="button" className={styles.iconButton} aria-label={`Delete ${thread.title}`} onClick={() => { if (window.confirm("Delete this conversation?")) { deleteConversation(thread.id); if (activeId === thread.id) setActiveId(""); } }}><FiTrash2/></button></li>)}</ul> : <p className={styles.empty}>Ask about saved project papers to start a conversation.</p>}
      <p className={styles.localTag}>Local keyword search · no AI service configured</p>
    </section>
    <section className={styles.panel}>
      <h2>{active?.title ?? "Search project papers"}</h2>
      {active?.messages.map((message) => <article className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={message.id}><small>{message.role === "user" ? "You" : "Local source search"}</small><p>{message.content}</p></article>)}
      <form onSubmit={submit}><label>Question or search terms<input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Search titles, abstracts, and keywords"/></label>{error && <p className={styles.error} role="alert">{error}</p>}<button className={styles.primary} type="submit"><FiSearch/> Search papers</button></form>
      <label className={styles.inlineSearch}>Find a paper<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter project sources"/></label>
      {query && <ul className={styles.searchResults}>{results.map(({ paper }) => <li key={paper.id}><Link href={`/projects/${projectId}/papers/${paper.id}`}><strong>{paper.title}</strong><small>{paper.abstract || "No abstract saved."}</small></Link></li>)}</ul>}
    </section>
  </div>;
}

function CompareTool({ projectId, papers }: { projectId: string; papers: ReturnType<typeof usePapers>["papers"] }) {
  const { comparisons, saveComparison } = useResearch();
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const compared = papers.filter((paper) => selected.includes(paper.id));
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  return <div className={styles.stack}>
    <section className={styles.panel}><div className={styles.panelHeader}><div><h2>Select papers</h2><p>Choose two or three saved sources to compare their metadata and abstracts.</p></div><span>{selected.length}/3 selected</span></div>
      {papers.length < 2 ? <p className={styles.empty}>Add at least two papers to this project before comparing them. <Link href={`/projects/${projectId}/papers/upload`}>Upload a paper</Link></p> : <div className={styles.paperChoices}>{papers.map((paper) => <label key={paper.id} className={styles.choice}><input type="checkbox" checked={selected.includes(paper.id)} disabled={!selected.includes(paper.id) && selected.length === 3} onChange={() => toggle(paper.id)}/><span><strong>{paper.title}</strong><small>{paper.authors.join(", ") || "Author not recorded"} · {paper.year}</small></span></label>)}</div>}
    </section>
    {compared.length >= 2 && <section className={styles.compareGrid}>{compared.map((paper) => <article className={styles.panel} key={paper.id}><h2>{paper.title}</h2><dl><dt>Authors</dt><dd>{paper.authors.join(", ") || "Not recorded"}</dd><dt>Year / venue</dt><dd>{paper.year} · {paper.journal}</dd><dt>Keywords</dt><dd>{paper.keywords.join(", ") || "Not recorded"}</dd><dt>Abstract</dt><dd>{paper.abstract || "No abstract saved."}</dd><dt>Reading status</dt><dd>{paper.status}</dd></dl></article>)}</section>}
    {compared.length >= 2 && <button className={styles.primary} onClick={() => { saveComparison(projectId, compared.map((paper) => paper.id)); setMessage("Comparison saved in this project."); }}><FiSave/> Save comparison</button>}
    {message && <p className={styles.feedback} role="status">{message}</p>}
    <p className={styles.localTag}>Comparison uses saved metadata only; no automated scientific conclusions are inferred.</p>
    <section className={styles.panel}><h2>Saved comparisons</h2>{comparisons.filter((item) => item.projectId === projectId).length === 0 ? <p className={styles.empty}>No comparisons saved yet.</p> : <ul className={styles.recordList}>{comparisons.filter((item) => item.projectId === projectId).map((item) => <li key={item.id}><span><strong>{item.paperIds.map((id) => papers.find((paper) => paper.id === id)?.title ?? "Removed paper").join(" · ")}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></span></li>)}</ul>}</section>
  </div>;
}

function GraphTool({ papers }: { papers: ReturnType<typeof usePapers>["papers"] }) {
  const relations = papers.flatMap((paper, index) => papers.slice(index + 1).map((other) => ({ a: paper, b: other, shared: [...new Set([...paper.tags, ...paper.keywords].map((item) => item.toLowerCase()))].filter((item) => [...other.tags, ...other.keywords].some((candidate) => candidate.toLowerCase() === item)) })).filter((relation) => relation.shared.length));
  return <div className={styles.stack}><section className={styles.panel}><h2>Paper relationships</h2><p className={styles.localTag}>Relationships are inferred only from matching saved tags and keywords, not citation records.</p>{papers.length === 0 ? <p className={styles.empty}>Add papers with keywords or tags to explore relationships.</p> : <ul className={styles.relationList}>{papers.map((paper) => <li key={paper.id}><Link href={`/projects/${paper.projectId}/papers/${paper.id}`}><strong>{paper.title}</strong><small>{paper.tags.concat(paper.keywords).join(" · ") || "No tags or keywords recorded"}</small></Link></li>)}</ul>}</section><section className={styles.panel}><h2>Shared topics</h2>{relations.length ? <ul className={styles.recordList}>{relations.map(({ a, b, shared }) => <li key={`${a.id}:${b.id}`}><span><strong>{a.title} ↔ {b.title}</strong><small>Shared: {shared.join(", ")}</small></span></li>)}</ul> : <p className={styles.empty}>No shared keywords found across this project’s papers.</p>}</section></div>;
}

function ReviewTool({ projectId, project, papers }: { projectId: string; project: Project; papers: ReturnType<typeof usePapers>["papers"] }) {
  const { notes, saveNote } = useResearch();
  const saved = notes.find((note) => note.projectId === projectId && note.id === `review-${projectId}`);
  const [draft, setDraft] = useState(saved?.content ?? "");
  const [message, setMessage] = useState("");
  const createDraft = () => setDraft(`# Literature review: ${project.name}\n\n## Scope\n${project.description || "Describe the scope of this review."}\n\n## Included sources\n${papers.map((paper) => `- ${paper.title} (${paper.year}; ${paper.journal})\n  ${paper.abstract || "Abstract not provided."}`).join("\n\n")}\n\n## Synthesis\nWrite a synthesis grounded in the sources above.\n\n## Limitations and open questions\nRecord limitations and unanswered questions here.`);
  const save = () => { if (!draft.trim()) { setMessage("Create or write a review draft before saving."); return; } saveNote({ id: `review-${projectId}`, projectId, title: "Literature Review", content: draft, updatedAt: new Date().toISOString() }); setMessage("Review draft saved on this device."); };
  return <div className={styles.stack}><section className={styles.panel}><div className={styles.panelHeader}><div><h2>Review draft</h2><p>{papers.length} project sources · generated from saved metadata only</p></div><span className={styles.localTag}>Not AI synthesized</span></div>{papers.length === 0 ? <p className={styles.empty}>Add project papers before preparing a review draft. <Link href={`/projects/${projectId}/papers/upload`}>Upload a paper</Link></p> : <><button className={styles.secondary} onClick={createDraft}>Build outline from papers</button><label className={styles.reviewEditor}>Editable review<textarea rows={20} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Build an outline from the paper metadata or write your review here…"/></label><button className={styles.primary} onClick={save}><FiSave/> Save draft</button>{message && <p role="status" className={styles.feedback}>{message}</p>}</>}</section></div>;
}

function ExportsTool({ project, papers }: { project: Project; papers: ReturnType<typeof usePapers>["papers"] }) {
  const { notes, conversations, comparisons } = useResearch();
  const data = { project, papers, notes: notes.filter((note) => note.projectId === project.id), conversations: conversations.filter((item) => item.projectId === project.id), comparisons: comparisons.filter((item) => item.projectId === project.id), exportedAt: new Date().toISOString() };
  const download = (filename: string, body: string, type: string) => {
    const url = URL.createObjectURL(new Blob([body], { type }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
  };
  const markdown = [`# ${project.name}`, project.description, "## Papers", ...papers.map((paper) => `### ${paper.title}\n${paper.authors.join(", ")} · ${paper.year} · ${paper.journal}\n\n${paper.abstract || "No abstract saved."}`), "## Notes", ...data.notes.map((note) => `### ${note.title}\n${note.content}`)].join("\n\n");
  const csv = ["title,authors,year,journal,status,tags", ...papers.map((paper) => [paper.title, paper.authors.join("; "), paper.year, paper.journal, paper.status, paper.tags.join("; ")].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))].join("\n");
  return <div className={styles.stack}><section className={styles.panel}><h2>Export project data</h2><p>Files are generated in your browser from locally saved project data.</p><div className={styles.exportActions}><button className={styles.primary} onClick={() => download(`${project.id}-archive.json`, JSON.stringify(data, null, 2), "application/json")}><FiDownload/> JSON archive</button><button className={styles.secondary} onClick={() => download(`${project.id}-research.md`, markdown, "text/markdown")}><FiDownload/> Research report</button><button className={styles.secondary} onClick={() => download(`${project.id}-papers.csv`, csv, "text/csv")}><FiDownload/> Paper metadata CSV</button></div><p className={styles.localTag}>PDF file contents are not included in exports.</p></section></div>;
}

function SettingsTool({ project, papers }: { project: Project; papers: ReturnType<typeof usePapers>["papers"] }) {
  const { updateProject, deleteProject } = useProjects();
  const { deleteProjectData } = useResearch();
  const { deleteProjectPapers } = usePapers();
  const router = useRouter();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [domain, setDomain] = useState(project.domain);
  const [tags, setTags] = useState(project.tags.join(", "));
  const [message, setMessage] = useState("");
  const save = (event: FormEvent) => { event.preventDefault(); if (!name.trim()) { setMessage("Project name is required."); return; } updateProject(project.id, { name: name.trim(), description: description.trim(), domain, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) }); setMessage("Project settings saved on this device."); };
  const remove = () => { if (!window.confirm(`Delete “${project.name}” and its ${papers.length} saved paper record(s)? This cannot be undone.`)) return; deleteProjectPapers(project.id); deleteProjectData(project.id); deleteProject(project.id); router.push("/projects"); };
  return <div className={styles.stack}><form className={styles.panel} onSubmit={save}><h2>Project details</h2><label>Project name<input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120}/></label><label>Description<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)}/></label><label>Research domain<input value={domain} onChange={(event) => setDomain(event.target.value)} required/></label><label>Tags<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="AI, NLP, Healthcare"/></label>{message && <p role="status" className={styles.feedback}>{message}</p>}<button className={styles.primary} type="submit"><FiSave/> Save settings</button></form><section className={`${styles.panel} ${styles.danger}`}><h2>Delete project</h2><p>This removes the project and its paper metadata, notes, conversations, and comparisons from this browser.</p><button type="button" onClick={remove}><FiTrash2/> Delete {project.name}</button></section></div>;
}

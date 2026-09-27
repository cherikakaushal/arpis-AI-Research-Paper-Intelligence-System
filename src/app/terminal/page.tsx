"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useResearch } from "@/components/research/ResearchProvider";

type TerminalLine = { id: string; text: string; tone?: "error" | "success" };
const help = "Commands: help | projects | papers | recent | search <terms> | project <id> | open <paper id or title> | clear";

export default function TerminalPage() {
  const { papers } = usePapers();
  const { projects } = useProjects();
  const { notes, conversations } = useResearch();
  const router = useRouter();
  const [command, setCommand] = useState("");
  const [lines, setLines] = useState<TerminalLine[]>([{ id: "welcome", text: `ARPIS local research console\n${help}` }]);
  const [nextId, setNextId] = useState(0);

  const execute = (event: FormEvent) => {
    event.preventDefault();
    const input = command.trim();
    if (!input) return;
    setCommand("");
    if (input.toLowerCase() === "clear") { setLines([]); return; }
    const [verb, ...args] = input.split(/\s+/);
    const value = args.join(" ");
    let result = "";
    let tone: TerminalLine["tone"];
    switch (verb.toLowerCase()) {
      case "help": result = help; break;
      case "projects": result = projects.length ? projects.map((project) => `${project.id}  ${project.name}`).join("\n") : "No projects saved."; break;
      case "papers": result = papers.length ? papers.map((paper) => `${paper.id}  ${paper.title} (${paper.year})`).join("\n") : "No papers saved."; break;
      case "recent": {
        const records = [...papers.map((paper) => ({ title: paper.title, date: paper.uploadedAt })), ...notes.map((note) => ({ title: note.title, date: note.updatedAt })), ...conversations.map((thread) => ({ title: thread.title, date: thread.updatedAt }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
        result = records.length ? records.map((record) => `${new Date(record.date).toLocaleDateString()}  ${record.title}`).join("\n") : "No research activity yet.";
        break;
      }
      case "search": {
        if (!value) { result = "Usage: search <terms>"; tone = "error"; break; }
        const matches = papers.filter((paper) => `${paper.title} ${paper.authors.join(" ")} ${paper.abstract} ${paper.keywords.join(" ")}`.toLowerCase().includes(value.toLowerCase()));
        result = matches.length ? matches.map((paper) => `${paper.title}\n  /projects/${paper.projectId}/papers/${paper.id}`).join("\n") : "No matching saved papers.";
        break;
      }
      case "project": {
        const project = projects.find((item) => item.id === value || item.name.toLowerCase() === value.toLowerCase());
        if (project) { router.push(`/projects/${project.id}`); result = `Opening ${project.name}…`; tone = "success"; }
        else { result = "Project not found. Run `projects` to list project IDs."; tone = "error"; }
        break;
      }
      case "open": {
        const paper = papers.find((item) => item.id === value || item.title.toLowerCase() === value.toLowerCase());
        if (paper) { router.push(`/projects/${paper.projectId}/papers/${paper.id}`); result = `Opening ${paper.title}…`; tone = "success"; }
        else { result = "Paper not found. Run `papers` to list paper IDs."; tone = "error"; }
        break;
      }
      default: result = `Unknown command: ${verb}. Type help for supported commands.`; tone = "error";
    }
    const time = new Date().toLocaleTimeString();
    setLines((current) => [...current, { id: `command-${nextId}`, text: `> ${input}`, tone: "success" }, { id: `result-${nextId}`, text: `[${time}] ${result}`, tone }]);
    setNextId((current) => current + 1);
  };

  return <main className="w3-padding-large" style={{ maxWidth: 1100, margin: "0 auto" }}>
    <h1 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: 6 }}>ARPIS Terminal</h1>
    <p style={{ color: "var(--arp-text-muted)", marginBottom: 18 }}>Search and navigate your local research workspace. This console does not execute shell commands.</p>
    <section aria-label="Terminal output" aria-live="polite" style={{ minHeight: 300, maxHeight: "60vh", overflowY: "auto", background: "rgba(0,0,0,.6)", borderRadius: 12, padding: 18, border: "1px solid var(--arp-border-subtle)", fontFamily: "Consolas,monospace", fontSize: ".83rem", whiteSpace: "pre-wrap" }}>{lines.map((line) => <div key={line.id} style={{ marginBottom: 8, color: line.tone === "error" ? "#ff8d8d" : line.tone === "success" ? "var(--arp-accent)" : "var(--arp-text-main)" }}>{line.text}</div>)}</section>
    <form onSubmit={execute} style={{ display: "flex", gap: 8, marginTop: 10 }}><label htmlFor="terminal-command" style={{ alignSelf: "center", fontFamily: "Consolas,monospace", color: "var(--arp-accent)" }}>{">"}</label><input id="terminal-command" value={command} onChange={(event) => setCommand(event.target.value)} autoComplete="off" spellCheck={false} placeholder="Type help to list commands" style={{ flex: 1, minWidth: 0, padding: 11, border: "1px solid var(--arp-border-subtle)", borderRadius: 8, background: "var(--arp-bg-alt)", color: "var(--arp-text-main)", fontFamily: "Consolas,monospace" }}/><button type="submit" className="w3-button w3-round-large" style={{ background: "var(--arp-accent)", color: "#031015", fontWeight: 700 }}>Run</button><button type="button" className="w3-button w3-round-large" onClick={() => setLines([])} style={{ border: "1px solid var(--arp-border-subtle)", color: "var(--arp-text-main)" }}>Clear</button></form>
  </main>;
}

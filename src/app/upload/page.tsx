"use client";

import Link from "next/link";
import { FiFileText, FiPlus } from "react-icons/fi";
import { useProjects } from "@/components/projects/ProjectProvider";

export default function UploadPage() {
  const { projects, ready, openCreateProject } = useProjects();
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "12px 0 48px" }}>
      <span style={{ color: "var(--arp-accent)", fontSize: ".7rem", textTransform: "uppercase" }}>Research workspace</span>
      <h1 style={{ fontSize: "2rem", margin: "8px 0" }}>Upload Research Paper</h1>
      <p style={{ color: "var(--arp-text-muted)" }}>Choose the project that should own this paper and its metadata.</p>
      {!ready ? (
        <p role="status">Loading projects…</p>
      ) : projects.length === 0 ? (
        <section className="arpis-glass-card" style={{ marginTop: 24, padding: 24 }}>
          <p>Create a project before adding a paper.</p>
          <button className="w3-button w3-round-large" onClick={openCreateProject}>
            <FiPlus /> Create project
          </button>
        </section>
      ) : (
        <section style={{ display: "grid", gap: 10, marginTop: 24 }}>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/papers/upload`}
              className="arpis-glass-card"
              style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}
            >
              <FiFileText color={project.color} />
              <span>
                <strong>{project.name}</strong>
                <small style={{ display: "block", color: "var(--arp-text-muted)", marginTop: 4 }}>
                  {project.description || project.domain}
                </small>
              </span>
              <span style={{ marginLeft: "auto", color: "var(--arp-accent)" }}>Add paper →</span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}

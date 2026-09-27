"use client";

import { usePapers } from "@/components/papers/PaperProvider";
import { useProjects } from "@/components/projects/ProjectProvider";
import { useResearch } from "@/components/research/ResearchProvider";

export default function StorageNotice() {
  const { storageError: projectError } = useProjects();
  const { storageError: paperError } = usePapers();
  const { storageError: researchError } = useResearch();
  const message = [projectError, paperError, researchError].filter(Boolean).join(" ");
  if (!message) return null;
  return <div role="status" style={{ padding: "9px 16px", borderBottom: "1px solid rgba(255,183,77,.45)", background: "rgba(255,183,77,.12)", color: "var(--arp-text-main)", fontSize: ".75rem" }}>{message}</div>;
}

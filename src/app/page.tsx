"use client";

import Link from "next/link";
import { FiArrowUpRight, FiClock, FiFileText, FiFolderPlus, FiPlus, FiStar, FiTrendingUp } from "react-icons/fi";
import { useProjects } from "@/components/projects/ProjectProvider";
import { usePapers } from "@/components/papers/PaperProvider";
import { useResearch } from "@/components/research/ResearchProvider";
import styles from "./page.module.css";

export default function HomePage() {
  const { projects, ready: projectsReady, openCreateProject } = useProjects();
  const { papers, ready: papersReady } = usePapers();
  const { notes, conversations, ready: researchReady } = useResearch();
  const favorites = papers.filter((paper) => paper.favorite);
  const ready = projectsReady && papersReady && researchReady;
  const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3);

  return <main className={styles.dashboard}>
    <header className={styles.hero}><div><p className={styles.eyebrow}>Research workspace</p><h1>Welcome back.</h1><p>Pick up where you left off or start a new research project.</p></div><button onClick={openCreateProject} className={styles.primaryButton}><FiPlus/> New project</button></header>
    <section className={styles.section}><div className={styles.sectionHeader}><div><h2>Recent projects</h2><p>Every paper, conversation, and insight stays in context.</p></div><Link href="/projects" className={styles.textLink}>View all <FiArrowUpRight/></Link></div><div className={styles.projectGrid}>
      {ready && recentProjects.map((project) => {
        const projectPapers = papers.filter((paper) => paper.projectId === project.id);
        const reviewed = projectPapers.filter((paper) => paper.status === "Reviewed" || paper.status === "Completed").length;
        const progress = projectPapers.length ? Math.round((reviewed / projectPapers.length) * 100) : 0;
        return <Link href={`/projects/${project.id}`} className={styles.projectCard} key={project.id}><div className={styles.projectIcon} style={{ color: project.color, background: `${project.color}1f` }}>{project.icon}</div><div className={styles.projectMeta}><span>{new Date(project.updatedAt).toLocaleDateString()}</span><FiArrowUpRight/></div><h3>{project.name}</h3><p>{projectPapers.length} papers</p><div className={styles.progress}><span style={{ width: `${progress}%` }}/></div><small>Reviewed papers {progress}%</small></Link>;
      })}
      <button onClick={openCreateProject} className={`${styles.projectCard} ${styles.newProjectCard}`}><span className={styles.addIcon}><FiPlus/></span><strong>Create a project</strong><p>Give your research a focused home.</p></button>
    </div></section>
    <div className={styles.contentGrid}><section className={styles.panel}><div className={styles.sectionHeader}><div><h2>Workspace activity</h2><p>Your research workspace at a glance</p></div><FiTrendingUp className={styles.panelIcon}/></div><div className={styles.statsGrid}><div><strong>{ready ? papers.length : "—"}</strong><span>Papers</span><small>Across projects</small></div><div><strong>{ready ? projects.length : "—"}</strong><span>Projects</span><small>Active workspaces</small></div><div><strong>{ready ? notes.length : "—"}</strong><span>Notes</span><small>Saved locally</small></div><div><strong>{ready ? conversations.length : "—"}</strong><span>Conversations</span><small>Local paper searches</small></div></div></section>
      <section className={styles.panel}><div className={styles.sectionHeader}><div><h2>Quick actions</h2><p>Start inside a research context</p></div></div><div className={styles.actions}><button onClick={openCreateProject}><FiFolderPlus/><span><strong>New project</strong><small>Define a research question</small></span><FiArrowUpRight/></button><Link href={projects[0] ? `/projects/${projects[0].id}/papers` : "/projects"}><FiFileText/><span><strong>Paper library</strong><small>Browse project sources</small></span><FiArrowUpRight/></Link><Link href="/history"><FiClock/><span><strong>Recent activity</strong><small>Review your research trail</small></span><FiArrowUpRight/></Link></div></section></div>
    <section className={styles.panel}><div className={styles.sectionHeader}><div><h2>Favorite papers</h2><p>Pinned papers from across your projects</p></div><FiStar className={styles.panelIcon}/></div><div className={styles.paperList}>{favorites.length ? favorites.map((paper) => <Link className={styles.paperRow} href={`/projects/${paper.projectId}/papers/${paper.id}`} key={paper.id}><span className={styles.fileIcon}><FiFileText/></span><div><strong>{paper.title}</strong><p>{paper.authors.join(", ")} · {paper.year}</p></div><FiArrowUpRight/></Link>) : <p>{ready ? "No favorite papers yet. Star a paper to pin it here." : "Loading papers…"}</p>}</div></section>
  </main>;
}

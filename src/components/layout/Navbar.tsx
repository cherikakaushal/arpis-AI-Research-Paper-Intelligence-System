"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MdLightMode, MdDarkMode } from "react-icons/md";

// Page label mapper
function getPageLabel(pathname: string) {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/projects/new")) return "New Project";
  if (pathname.startsWith("/projects/")) return "Project Workspace";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/upload")) return "Upload Research Paper";
  if (pathname.startsWith("/analyze")) return "Analyzing Paper";
  if (pathname.startsWith("/results")) return "Analysis Results";
  if (pathname.startsWith("/history")) return "History";
  return "AI Research Paper Intelligence System";
}

export default function Navbar() {
  const pathname = usePathname();
  const pageLabel = getPageLabel(pathname);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load saved theme
  useEffect(() => {
    const saved =
      (localStorage.getItem("arpis_theme") as "dark" | "light") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("arpis_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // Open sidebar (mobile)
  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent("arpis-open-menu"));
  };

  return (
    <header className="arpis-navbar">
      {/* LEFT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

        {/* HAMBURGER MENU BUTTON (Mobile Only) */}
        {isMobile && (
          <button
            onClick={openSidebar}
            style={{
              background: "transparent",
              border: "1px solid var(--arpis-border-subtle)",
              padding: "6px 10px",
              borderRadius: "8px",
              color: "var(--arpis-text-main)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
            }}
          >
            ☰
          </button>
        )}

        {/* PAGE LABEL */}
        <div className="arpis-navbar-title">{pageLabel}</div>
      </div>

      {/* RIGHT SIDE */}
      <div className="arpis-navbar-right">

        {/* MODE CHIP */}
        <div className="arpis-chip">Research OS</div>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          className="w3-button w3-round-large"
          style={{
            background: "transparent",
            border: "1px solid var(--arpis-border-subtle)",
            color: "var(--arpis-text-main)",
            padding: "6px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {theme === "dark" ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
        </button>
      </div>
    </header>
  );
}

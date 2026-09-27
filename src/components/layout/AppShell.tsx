"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import StorageNotice from "./StorageNotice";
import React from "react";

/**
 * CERN-GRADE SHELL
 * -------------------------
 * Features:
 * ✔ Responsive 2-column layout
 * ✔ Full height grid
 * ✔ Transparent top overlay for particles
 * ✔ Gradient + neon accents
 * ✔ Sidebar fixed, content scrollable
 * ✔ Works with 3D WebGL & heavy canvases
 * ✔ Compatible with W3CSS
 */

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="arpis-shell-root">
      {/* MAIN GRID */}
      <div className="arpis-shell-grid">
        {/* FIXED SIDEBAR */}
        <aside className="arpis-shell-sidebar">
          <Sidebar />
        </aside>

        {/* MAIN PANEL */}
        <section className="arpis-shell-main">
          <Navbar />
          <StorageNotice />

          {/* CONTENT SCROLL REGION */}
          <div className="arpis-shell-content">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}

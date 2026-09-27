// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import "../styles/theme.css";

import ParticleField from "@/components/layout/ParticleField";
import AppShell from "@/components/layout/AppShell";
import { ProjectProvider } from "@/components/projects/ProjectProvider";
import { PaperProvider } from "@/components/papers/PaperProvider";
import { ResearchProvider } from "@/components/research/ResearchProvider";

// META + FAVICON
export const metadata: Metadata = {
  title: "ARPIS — AI Research Operating System",
  description:
    "A project-first AI workspace for papers, notes, conversations, knowledge graphs, and literature reviews.",

  icons: {
    icon: "/favicon.png?v=10",
    shortcut: "/favicon.png?v=10",
    apple: "/favicon.png?v=10",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* W3CSS CDN */}
        <link
          rel="stylesheet"
          href="https://www.w3schools.com/w3css/4/w3.css"
        />

        {/* FAVICON OVERRIDES (SSR SAFE) */}
        <link rel="icon" href="/favicon.png?v=10" type="image/png" />
        <link rel="shortcut icon" href="/favicon.png?v=10" />
        <link rel="apple-touch-icon" href="/favicon.png?v=10" />
      </head>

      <body
        className="arpis-root"
        suppressHydrationWarning={true}
      >
        {/* PARTICLE BACKGROUND (CLIENT-ONLY) */}
        <ParticleField />

        {/* FULL APP LAYOUT */}
        <ProjectProvider><PaperProvider><ResearchProvider><AppShell>{children}</AppShell></ResearchProvider></PaperProvider></ProjectProvider>
      </body>
    </html>
  );
}

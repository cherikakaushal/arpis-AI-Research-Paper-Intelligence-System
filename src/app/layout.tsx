// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import "../styles/theme.css";
import '@/components/product/product.css';
import { WorkspaceProvider } from '@/store/WorkspaceProvider';

import AppShell from '@/components/product/Shell';
import { ProjectProvider } from "@/components/projects/ProjectProvider";
import { PaperProvider } from "@/components/papers/PaperProvider";
import { ResearchProvider } from "@/components/research/ResearchProvider";

// META + FAVICON
export const metadata: Metadata = {
  title: "ARPIS — AI Research Operating System",
  description:
    "A project-first AI workspace for papers, notes, conversations, knowledge graphs, and literature reviews.",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
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

        {/* FAVICON OVERRIDES (SSR SAFE) */}
        <link rel="icon" href="/favicon.ico" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>

      <body
        className="arpis-root"
        suppressHydrationWarning={true}
      >
        {/* PARTICLE BACKGROUND (CLIENT-ONLY) */}

        {/* FULL APP LAYOUT */}
        <WorkspaceProvider><ProjectProvider><PaperProvider><ResearchProvider><AppShell>{children}</AppShell></ResearchProvider></PaperProvider></ProjectProvider></WorkspaceProvider>
      </body>
    </html>
  );
}



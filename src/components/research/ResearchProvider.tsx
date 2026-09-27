"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Note = {
  id: string;
  projectId: string;
  paperId?: string;
  title: string;
  content: string;
  updatedAt: string;
};

type ChatMessage = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
type Conversation = { id: string; projectId: string; title: string; messages: ChatMessage[]; updatedAt: string };
type Comparison = { id: string; projectId: string; paperIds: string[]; createdAt: string };
type ResearchData = { notes: Note[]; conversations: Conversation[]; comparisons: Comparison[] };

type ResearchContextValue = ResearchData & {
  ready: boolean;
  storageError: string;
  saveNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  createConversation: (projectId: string, title: string) => Conversation;
  saveConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string) => void;
  saveComparison: (projectId: string, paperIds: string[]) => void;
  deleteProjectData: (projectId: string) => void;
  deletePaperData: (paperId: string) => void;
};

const STORAGE_KEY = "arpis_research_v1";
const emptyData: ResearchData = { notes: [], conversations: [], comparisons: [] };
const Context = createContext<ResearchContextValue | null>(null);

function readData(): ResearchData {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return emptyData;
    const data = parsed as Partial<ResearchData>;
    return {
      notes: Array.isArray(data.notes) ? data.notes : [],
      conversations: Array.isArray(data.conversations) ? data.conversations : [],
      comparisons: Array.isArray(data.comparisons) ? data.comparisons : [],
    };
  } catch {
    return emptyData;
  }
}

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ResearchData>(emptyData);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setData(readData());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = (next: ResearchData) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError("Research notes, conversations, and comparisons are only in memory because browser storage is unavailable.");
    }
  };

  const value = useMemo<ResearchContextValue>(() => ({
    ...data,
    ready,
    storageError,
    saveNote: (note) => persist({ ...data, notes: [note, ...data.notes.filter((item) => item.id !== note.id)] }),
    deleteNote: (id) => persist({ ...data, notes: data.notes.filter((note) => note.id !== id) }),
    createConversation: (projectId, title) => {
      const now = new Date().toISOString();
      const conversation = { id: crypto.randomUUID(), projectId, title, messages: [], updatedAt: now };
      persist({ ...data, conversations: [conversation, ...data.conversations] });
      return conversation;
    },
    saveConversation: (conversation) => persist({ ...data, conversations: [conversation, ...data.conversations.filter((item) => item.id !== conversation.id)] }),
    deleteConversation: (id) => persist({ ...data, conversations: data.conversations.filter((item) => item.id !== id) }),
    saveComparison: (projectId, paperIds) => {
      const comparison = { id: crypto.randomUUID(), projectId, paperIds, createdAt: new Date().toISOString() };
      persist({ ...data, comparisons: [comparison, ...data.comparisons] });
    },
    deleteProjectData: (projectId) => persist({
      notes: data.notes.filter((note) => note.projectId !== projectId),
      conversations: data.conversations.filter((conversation) => conversation.projectId !== projectId),
      comparisons: data.comparisons.filter((comparison) => comparison.projectId !== projectId),
    }),
    deletePaperData: (paperId) => persist({
      notes: data.notes.filter((note) => note.paperId !== paperId),
      conversations: data.conversations,
      comparisons: data.comparisons.filter((comparison) => !comparison.paperIds.includes(paperId)),
    }),
  }), [data, ready, storageError]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useResearch() {
  const value = useContext(Context);
  if (!value) throw new Error("useResearch must be inside ResearchProvider");
  return value;
}

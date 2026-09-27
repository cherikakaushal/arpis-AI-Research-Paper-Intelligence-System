"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./playlab.css";

const GRID_SIZE = 9;
const TOTAL_ROUNDS = 20;
const ROUND_MS = 800;

/* ============================================
   NEURAL FOCUS GAME
============================================ */
function NeuralFocusGame() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "finished">("idle");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const roundRef = useRef(0);

  const startGame = () => {
    setScore(0);
    setRound(0);
    roundRef.current = 0;
    setStatus("running");
    setActiveIndex(2);
  };

  const stopGame = () => {
    setStatus("finished");
    setActiveIndex(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (status !== "running") return;

    intervalRef.current = setInterval(() => {
      const next = roundRef.current + 1;
      if (next >= TOTAL_ROUNDS) {
        setRound(TOTAL_ROUNDS);
        setStatus("finished");
        setActiveIndex(null);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      roundRef.current = next;
      setRound(next);
      setActiveIndex((next * 5 + 2) % GRID_SIZE);
    }, ROUND_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  const handleCellClick = (i: number) => {
    if (status !== "running") return;
    if (i === activeIndex) {
      setScore((s) => s + 1);
      setActiveIndex((current) => ((current ?? 0) + 4) % GRID_SIZE);
    }
  };

  return (
    <div className="playlab-card w3-card-4 w3-round-xxlarge">
      <div className="w3-row">
        {/* LEFT — TEXT */}
        <div className="w3-col m7 s12">
          <h3 style={{ marginTop: 0 }}>🎯 Neural Focus</h3>
          <p className="w3-small">
            A <b>reaction game for researchers</b>. Hit the glowing node before
            it jumps. You get <b>{TOTAL_ROUNDS}</b> rounds.
          </p>

          <div className="w3-margin-top w3-small">
            Status:{" "}
            <span style={{ color: "var(--arpis-cyan)" }}>
              {status === "idle" && "Ready"}
              {status === "running" && "Running…"}
              {status === "finished" && "Finished"}
            </span>
          </div>

          <div className="w3-margin-top">
            <button
              onClick={startGame}
              className="playlab-button primary"
              style={{ marginRight: "10px" }}
            >
              {status === "running" ? "Restart" : "Start"}
            </button>

            {status === "running" && (
              <button onClick={stopGame} className="playlab-button secondary">
                Stop
              </button>
            )}
          </div>

          <div className="w3-margin-top w3-small">
            Score: <b>{score}</b> / {TOTAL_ROUNDS}
            <br />
            Round: {Math.min(round + 1, TOTAL_ROUNDS)}
          </div>
        </div>

        {/* RIGHT — GRID */}
        <div className="w3-col m5 s12 w3-margin-top">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {Array.from({ length: GRID_SIZE }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className={`playlab-cell ${activeIndex === idx && status === "running" ? "active" : ""
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   PAGE WRAPPER
============================================ */

export default function PlayLabPage() {
  return (
    <main
      className="w3-container w3-animate-opacity"
      style={{ padding: "40px 16px", maxWidth: "1120px", margin: "0 auto" }}
    >
      {/* HERO */}
      <section className="w3-margin-bottom">
        <span className="w3-tag w3-round-large w3-small w3-text-black w3-green w3-opacity-min">
          New · ARPIS PlayLab (frontend only)
        </span>

        <h1
          style={{
            fontSize: "2.4rem",
            marginTop: "18px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          ARPIS PlayLab
        </h1>

        <p style={{ maxWidth: "540px", opacity: 0.75 }}>
          Tiny games for big brains. Take a break from PDFs without leaving
          your browser.
        </p>
      </section>

      {/* GAME + SIDEBAR */}
      <section className="w3-margin-bottom">
        <div className="w3-row-padding">
          <div className="w3-col l8 m12 s12 w3-margin-bottom">
            <NeuralFocusGame />
          </div>

          {/* RESEARCH SHORTCUTS */}
          <div className="w3-col l4 m12 s12 w3-margin-bottom">
            <div className="playlab-card w3-card-4 w3-round-xxlarge">
              <h4>Back to research</h4>
              <p className="w3-small">Your project data stays ready while you take a break.</p>
              <p><Link href="/projects">Browse projects →</Link></p>
              <p><Link href="/workspace">Open paper workspace →</Link></p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTNOTE */}
      <section className="w3-small" style={{ opacity: 0.7 }}>
        PlayLab is fully <b>zero-backend</b>. Everything runs in your browser.
      </section>
    </main>
  );
}

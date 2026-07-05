import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  speak,
  setupSpacebarListening,
  removeSpacebarListening,
} from "../utils/voiceUtils";

import AIAssistant from "../components/AIAssistant";

/* ─────────────────────────────────────────
   Design tokens — same as all other pages
───────────────────────────────────────── */
const T = {
  bg: "#f8f9fc",
  surface: "#ffffff",
  surfaceHi: "#f0f2fa",
  border: "#e2e5ef",
  borderHi: "#5b52e8",
  accent: "#5b52e8",
  accentDim: "#c8c5f8",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  textPri: "#111827",
  textSec: "#6b7280",
  textMuted: "#9ca3af",
  radius: "12px",
  font: "'Inter', 'Segoe UI', sans-serif",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: T.bg,
    fontFamily: T.font,
    color: T.textPri,
    display: "flex",
    flexDirection: "column",
  },

  /* ── top bar ── */
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 28px",
    borderBottom: `1px solid ${T.border}`,
    background: T.surface,
    flexShrink: 0,
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: T.textSec,
    background: "transparent",
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: T.font,
  },
  topBarLogo: {
    fontSize: "13px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: T.accent,
    fontWeight: 600,
  },
  courseTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: T.textPri,
  },
  modeBadge: (m) => {
    const map = {
      learn: { bg: T.accent + "18", border: T.accent + "40", color: T.accent, label: "Learn mode" },
      ai: { bg: T.success + "18", border: T.success + "40", color: T.success, label: "AI assistant" },
    };
    const s = map[m] || map.learn;
    return {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "5px 12px",
      borderRadius: "20px",
      background: s.bg,
      border: `1px solid ${s.border}`,
      fontSize: "12px",
      fontWeight: 600,
      color: s.color,
    };
  },
  modeDot: (m) => {
    const colors = { learn: T.accent, ai: T.success };
    const c = colors[m] || T.accent;
    return {
      width: "7px",
      height: "7px",
      borderRadius: "50%",
      background: c,
      boxShadow: `0 0 5px ${c}`,
    };
  },

  /* ── body ── */
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },

  /* ── left sidebar — module list ── */
  sidebar: {
    width: "260px",
    flexShrink: 0,
    borderRight: `1px solid ${T.border}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "20px 20px 12px",
    borderBottom: `1px solid ${T.border}`,
  },
  sidebarLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: T.textMuted,
    margin: 0,
  },
  moduleList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
  },
  moduleItem: (active) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: active ? T.surfaceHi : "transparent",
    border: `1px solid ${active ? T.borderHi : "transparent"}`,
    marginBottom: "4px",
    cursor: "default",
  }),
  moduleNum: (active) => ({
    width: "22px",
    height: "22px",
    borderRadius: "6px",
    background: active ? T.accent : T.surface,
    border: `1px solid ${active ? T.accent : T.border}`,
    color: active ? "#111827" : T.textMuted,
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  }),
  moduleText: (active) => ({
    fontSize: "13px",
    color: active ? T.textPri : T.textSec,
    fontWeight: active ? 500 : 400,
    lineHeight: 1.4,
    flex: 1,
    // clamp to 2 lines
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  }),

  /* ── main content ── */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  /* ── module reader ── */
  reader: {
    flex: 1,
    padding: "36px 40px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  readerMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  readerMetaNum: {
    fontSize: "12px",
    color: T.textMuted,
    fontWeight: 500,
  },
  progressBar: {
    flex: 1,
    height: "3px",
    background: T.border,
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: T.accent,
    borderRadius: "2px",
    transition: "width 0.4s ease",
  }),
  readerMetaPct: {
    fontSize: "12px",
    color: T.accent,
    fontWeight: 600,
  },
  moduleContent: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: T.textPri,
    fontWeight: 400,
    maxWidth: "680px",
  },

  /* ── command grid ── */
  cmdGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "8px",
    maxWidth: "680px",
  },
  cmdPill: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "10px",
    background: active ? T.accent + "18" : T.surface,
    border: `1px solid ${active ? T.accent + "50" : T.border}`,
    fontSize: "12px",
    fontWeight: 500,
    color: active ? T.accent : T.textSec,
  }),
  cmdKey: {
    fontSize: "11px",
    fontWeight: 700,
    color: T.textMuted,
    background: T.border,
    borderRadius: "4px",
    padding: "1px 5px",
    fontFamily: "monospace",
  },

  /* ── AI panel overlay ── */
  aiPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: T.bg,
  },
  aiHeader: {
    padding: "20px 40px 16px",
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  aiHeaderTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: T.textPri,
    margin: 0,
  },
  aiHeaderSub: {
    fontSize: "13px",
    color: T.textSec,
    margin: "2px 0 0",
  },
  aiBody: {
    flex: 1,
    padding: "24px 40px",
    overflowY: "auto",
  },
  aiCmdGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    maxWidth: "500px",
    marginBottom: "24px",
  },
  aiCmd: (color) => ({
    padding: "12px 14px",
    borderRadius: T.radius,
    background: color + "12",
    border: `1px solid ${color}30`,
    fontSize: "13px",
    fontWeight: 600,
    color: color,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  }),
  aiCmdSub: {
    fontSize: "11px",
    fontWeight: 400,
    opacity: 0.7,
  },

  /* ── bottom voice bar ── */
  voiceBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 28px",
    borderTop: `1px solid ${T.border}`,
    background: T.surface,
    flexShrink: 0,
  },
  micIcon: {
    width: "16px",
    height: "16px",
    fill: T.accent,
    flexShrink: 0,
  },
  voiceBarText: {
    fontSize: "13px",
    color: T.textSec,
  },

  /* ── loading / error states ── */
  centered: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    color: T.textSec,
  },
  loadingDots: {
    display: "flex",
    gap: "6px",
  },
  dot: (delay) => ({
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: T.accent,
    animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
  }),
};

/* ════════════════════════════════════════
   COMMAND NORMALIZER — unchanged
════════════════════════════════════════ */
const normalizeCommand = (cmd) => {
  const c = cmd.toLowerCase().trim();
  if (c.includes("next")) return "next";
  if (
    c.includes("previous") ||
    c.includes("prev") ||
    c.includes("before")
  ) return "previous";
  if (c.includes("repeat")) return "repeat";
  if (c.includes("help")) return "help";
  if (c.includes("where")) return "where";
  if (c.includes("assistant") || c.includes("ai")) return "ai";
  if (c.includes("back")) return "back";
  if (c.includes("summarize") || c.includes("summarise") || c.includes("summary")) return "summarize";
  if (c.includes("explain") || c.includes("simple") || c.includes("easy")) return "simple";
  if (c.includes("example") || c.includes("real") || c.includes("instance")) return "example";
  return "unknown";
};

/* ════════════════════════════════════════
   COURSEDETAIL COMPONENT
════════════════════════════════════════ */
const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState("learn");
  const [aiHandler, setAIHandler] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentRef = useRef(0);
  const modeRef = useRef("learn");
  const courseRef = useRef(null);

  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { courseRef.current = course; }, [course]);

  /* ── fetch ── */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${localStorage.getItem("token")}`;
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(res.data);
        setCurrent(0);
        setLoading(false);
      } catch {
        setLoading(false);
        speak("Error fetching course. Please go back and try again.");
      }
    };
    fetchCourse();
  }, [id]);

  /* ── orientation ── */
  const speakOrientation = (courseData) => {
    const c = courseData || courseRef.current;
    if (!c) return;
    const modules = c.modules || [];
    const userName = localStorage.getItem("username") || "Student";
    speak(
      `Welcome ${userName}. ` +
      `You are inside the course ${c.title}. ` +
      `It contains ${modules.length} learning modules. ` +
      `You are currently on module ${currentRef.current + 1}. ` +
      `Say next to move to the next module. ` +
      `Say previous to move to the previous module.` +
      `Say repeat to hear the current module again. ` +
      `Say assistant to use the AI assistant. ` +
      `Say help at any time to hear these commands again.`
    );
  };

  useEffect(() => {
    if (!course) return;
    speakOrientation(course);
  }, [course]);

  /* ── voice handler — unchanged logic ── */
  useEffect(() => {
    if (!course) return;

    const handleCommand = (transcript) => {
      const action = normalizeCommand(transcript);
      const c = courseRef.current;
      const modNow = modeRef.current;
      const curNow = currentRef.current;

      // ── AI mode ──
      if (modNow === "ai") {
        if (action === "back") {
          setMode("learn");
          modeRef.current = "learn";
          speak(`Returning to course. Module ${curNow + 1}. Say next, repeat, assistant, or help.`);
        } else if (action === "summarize") {
          speak("Summarizing this module.");
          aiHandler?.("summarize");
        } else if (action === "simple") {
          speak("Explaining in simple terms.");
          aiHandler?.("simple");
        } else if (action === "example") {
          speak("Giving a real world example.");
          aiHandler?.("example");
        } else if (action === "repeat" || action === "help") {
          speak(
            `You are in the AI assistant. ` +
            `Say summarize to get a summary. ` +
            `Say explain for a simple explanation. ` +
            `Say example for a real world example. ` +
            `Say back to return to the course.`
          );
        } else if (action === "where") {
          speak(`You are in the AI assistant for module ${curNow + 1} of ${c.title}.`);
        } else {
          speak("Say summarize, explain, example, or back.");
        }
        return;
      }

      // ── Learn mode ──
      if (modNow === "learn") {
        if (action === "next") {
          if (curNow + 1 < (c.modules || []).length) {
            const next = curNow + 1;
            setCurrent(next);
            speak(
              `Module ${next + 1} of ${(c.modules || []).length}. ` +
              `${c.modules[next]}. ` +
              `Say next, repeat, assistant, or help.`
            );
          } else {
            speak(
              `You have reached the end of all modules. ` +
              `Say repeat to hear the last module again or say assistant for AI help.`
            );
          }
          return;
        }
        if (action === "previous") {
          if (curNow > 0) {
            const prev = curNow - 1;

            setCurrent(prev);

            speak(
              `Module ${prev + 1} of ${(c.modules || []).length}. ` +
              `${c.modules[prev]}. ` +
              `Say next, previous, repeat, assistant, back to courses, or help.`
            );
          } else {
            speak(
              "You are already at the first module. " +
              "Say next, assistant, back to courses, or help."
            );
          }

          return;
        }
        if (action === "back") {
          speak("Returning to courses.");

          setTimeout(() => {
            navigate("/courses");
          }, 300);

          return;
        }
        if (action === "repeat") {
          speak(
            `Module ${curNow + 1} of ${(c.modules || []).length}. ` +
            `${(c.modules || [])[curNow]}.`
          );
          return;
        }
        if (action === "ai") {
          setMode("ai");
          modeRef.current = "ai";
          speak(
            `AI assistant activated. ` +
            `Say summarize, explain, or example. ` +
            `Say back to return to the course.`
          );
          return;
        }
        if (action === "help") {
          speakOrientation();
          return;
        }
        if (action === "where") {
          speak(`You are in course ${c.title}, module ${curNow + 1} of ${c.modules.length}.`);
          return;
        }
        speak(`Command not recognized. Say next, repeat, assistant, or help.`);
      }
    };

    setupSpacebarListening(handleCommand);
    return () => removeSpacebarListening();
  }, [course, aiHandler]);

  /* ── derived values ── */
  const modules = course?.modules || [];
  const total = modules.length;
  const progress = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  const userName = localStorage.getItem("username") || "Student";

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1);   }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 2px; }
      `}</style>

      <div style={styles.page} role="main" aria-label="Course detail">

        {/* ── Top bar ── */}
        <header style={styles.topBar}>
          <div style={styles.topLeft}>
            <button
              style={styles.backBtn}
              onClick={() => navigate("/courses")}
              aria-label="Back to course list"
            >
              ← Courses
            </button>
            <span style={styles.topBarLogo} aria-hidden="true">
              {course?.title || "Loading…"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Mode badge */}
            {course && (
              <div
                style={styles.modeBadge(mode)}
                role="status"
                aria-live="polite"
                aria-label={mode === "ai" ? "AI assistant mode" : "Learn mode"}
              >
                <div style={styles.modeDot(mode)} aria-hidden="true" />
                {mode === "ai" ? "AI assistant" : "Learn mode"}
              </div>
            )}
            <span style={{ fontSize: "13px", color: T.textSec }}>{userName}</span>
          </div>
        </header>

        {/* ── Loading ── */}
        {loading && (
          <div style={styles.centered} aria-label="Loading course">
            <div style={styles.loadingDots}>
              <div style={styles.dot(0)} aria-hidden="true" />
              <div style={styles.dot(0.2)} aria-hidden="true" />
              <div style={styles.dot(0.4)} aria-hidden="true" />
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: T.textSec }}>
              Loading course…
            </p>
          </div>
        )}

        {/* ── Main body ── */}
        {!loading && course && (
          <div style={styles.body}>

            {/* ── Sidebar — module list ── */}
            <aside style={styles.sidebar} aria-label="Module list">
              <div style={styles.sidebarHeader}>
                <p style={styles.sidebarLabel}>
                  {total} module{total !== 1 ? "s" : ""}
                </p>
              </div>
              <div style={styles.moduleList} role="list">
                {modules.map((mod, i) => (
                  <div
                    key={i}
                    style={styles.moduleItem(i === current)}
                    role="listitem"
                    aria-current={i === current ? "true" : undefined}
                    aria-label={`Module ${i + 1}${i === current ? " — current" : ""}`}
                  >
                    <div style={styles.moduleNum(i === current)}>{i + 1}</div>
                    <span style={styles.moduleText(i === current)}>
                      {typeof mod === "string"
                        ? (mod.length > 60 ? mod.slice(0, 60) + "…" : mod)
                        : mod?.title || `Module ${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </aside>

            {/* ── Main content ── */}
            <main style={styles.main}>

              {/* ── LEARN MODE ── */}
              {mode === "learn" && (
                <div style={styles.reader} aria-label="Module content">

                  {/* Progress */}
                  <div style={styles.readerMeta}>
                    <span style={styles.readerMetaNum}>
                      Module {current + 1} of {total}
                    </span>
                    <div style={styles.progressBar} aria-hidden="true">
                      <div style={styles.progressFill(progress)} />
                    </div>
                    <span style={styles.readerMetaPct}>{progress}%</span>
                  </div>

                  {/* Module text */}
                  <div
                    style={styles.moduleContent}
                    role="article"
                    aria-label={`Module ${current + 1} content`}
                  >
                    {modules[current]}
                  </div>

                  {/* Command reference */}
                  <div>
                    <p style={{ fontSize: "11px", color: T.textMuted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      Voice commands
                    </p>
                    <div style={styles.cmdGrid} aria-hidden="true">
                      {[
                        { cmd: "next", hint: "next module" },
                        { cmd: "previous", hint: "previous module" },
                        { cmd: "repeat", hint: "hear again" },
                        { cmd: "assistant", hint: "AI help" },
                        { cmd: "where", hint: "my location" },
                        { cmd: "back", hint: "back to courses" },
                        { cmd: "help", hint: "all commands" }
                      ].map(({ cmd, hint }) => (
                        <div key={cmd} style={styles.cmdPill(false)}>
                          <span style={styles.cmdKey}>say</span>
                          <span>{cmd}</span>
                          <span style={{ color: T.textMuted, fontSize: "11px" }}>— {hint}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ── AI MODE ── */}
              {mode === "ai" && (
                <div style={styles.aiPanel}>
                  <div style={styles.aiHeader}>
                    <div>
                      <h2 style={styles.aiHeaderTitle}>AI Assistant</h2>
                      <p style={styles.aiHeaderSub}>
                        Module {current + 1} — {course.title}
                      </p>
                    </div>
                  </div>

                  <div style={styles.aiBody}>
                    {/* AI command reference */}
                    {/* <div style={styles.aiCmdGrid} aria-hidden="true">
                      <div style={styles.aiCmd(T.accent)}>
                        <span>Summarize</span>
                        <span style={styles.aiCmdSub}>key points only</span>
                      </div>
                      <div style={styles.aiCmd(T.success)}>
                        <span>Explain</span>
                        <span style={styles.aiCmdSub}>simple language</span>
                      </div>
                      <div style={styles.aiCmd(T.warning)}>
                        <span>Example</span>
                        <span style={styles.aiCmdSub}>real world use</span>
                      </div>
                    </div> */}

                    {/* AI component */}
                    <AIAssistant
                      moduleText={modules[current]}
                      setAIHandler={setAIHandler}
                    />
                  </div>
                </div>
              )}

            </main>
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && !course && (
          <div style={styles.centered}>
            <p style={{ color: T.danger, fontSize: "15px", margin: 0 }}>
              Could not load course
            </p>
            <p style={{ color: T.textSec, fontSize: "13px", margin: 0 }}>
              Check your connection and go back to try again
            </p>
          </div>
        )}

        {/* ── Bottom voice bar ── */}
        <footer style={styles.voiceBar} aria-hidden="true">
          <svg style={styles.micIcon} viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.243a.75.75 0 0 1 .736.912A7.003 7.003 0 0 1 12.75 17.92V20h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5v-2.08A7.003 7.003 0 0 1 4.9 11.155a.75.75 0 0 1 1.472-.311A5.5 5.5 0 0 0 17.5 11c0-.072-.002-.144-.006-.215a.75.75 0 0 1 .87-.542z" />
          </svg>
          <span style={styles.voiceBarText}>
            Hold spacebar · speak command · release
          </span>
          {course && (
            <span style={{ marginLeft: "auto", fontSize: "12px", color: T.textMuted }}>
              {mode === "ai"
                ? "Say: summarize · explain · example · back"
                : "Say: next · repeat · assistant · help"}
            </span>
          )}
        </footer>

      </div>
    </>
  );
};

export default CourseDetail;
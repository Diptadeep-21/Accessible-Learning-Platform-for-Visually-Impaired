import { useState, useEffect, useCallback } from "react";
import { speak } from "../utils/voiceUtils";

/* ─────────────────────────────────────────
   Design tokens — same as all other pages
───────────────────────────────────────── */
const T = {
  bg:        "#f8f9fc",
  surface:   "#ffffff",
  surfaceHi: "#f0f2fa",
  border:    "#e2e5ef",
  borderHi:  "#5b52e8",
  accent:    "#5b52e8",
  accentDim: "#c8c5f8",
  success:   "#16a34a",
  warning:   "#d97706",
  danger:    "#dc2626",
  textPri:   "#111827",
  textSec:   "#6b7280",
  textMuted: "#9ca3af",
  radius:    "12px",
  font:      "'Inter', 'Segoe UI', sans-serif",
};

/* ─────────────────────────────────────────
   Action config — one place for all three
───────────────────────────────────────── */
const ACTIONS = [
  {
    key:   "summarize",
    label: "Summarize",
    sub:   "Key points only",
    color: T.accent,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    key:   "simple",
    label: "Explain",
    sub:   "Simple language",
    color: T.success,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
  },
  {
    key:   "example",
    label: "Example",
    sub:   "Real-world use",
    color: T.warning,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
];

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: T.font,
  },

  /* ── action buttons row ── */
  actionRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  actionBtn: (color, active, loading) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    padding: "14px 16px",
    borderRadius: T.radius,
    background: active ? color + "20" : T.surface,
    border: `1px solid ${active ? color + "60" : T.border}`,
    cursor: loading ? "not-allowed" : "pointer",
    fontFamily: T.font,
    transition: "border-color 0.2s, background 0.2s",
    opacity: loading ? 0.6 : 1,
    textAlign: "left",
  }),
  actionIcon: (color, active) => ({
    color: active ? color : T.textMuted,
    transition: "color 0.2s",
  }),
  actionLabel: (color, active) => ({
    fontSize: "13px",
    fontWeight: 600,
    color: active ? color : T.textSec,
    margin: 0,
    transition: "color 0.2s",
  }),
  actionSub: {
    fontSize: "11px",
    color: T.textMuted,
    margin: 0,
  },

  /* ── loading state ── */
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 16px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
  },
  loadingDots: {
    display: "flex",
    gap: "5px",
  },
  dot: (delay) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: T.accent,
    animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
  }),
  loadingText: {
    fontSize: "13px",
    color: T.textSec,
  },

  /* ── response card ── */
  responseCard: (color) => ({
    background: T.surfaceHi,
    border: `1px solid ${color + "40"}`,
    borderRadius: T.radius,
    overflow: "hidden",
  }),
  responseHeader: (color) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderBottom: `1px solid ${color + "30"}`,
    background: color + "10",
  }),
  responseHeaderDot: (color) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 5px ${color}`,
    flexShrink: 0,
  }),
  responseHeaderLabel: (color) => ({
    fontSize: "12px",
    fontWeight: 600,
    color: color,
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  }),
  responseBody: {
    padding: "18px 20px",
    fontSize: "15px",
    lineHeight: 1.8,
    color: T.textPri,
    whiteSpace: "pre-wrap",
    margin: 0,
  },

  /* ── voice hint ── */
  voiceHint: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    color: T.textMuted,
    padding: "10px 14px",
    background: "#f8f9fc",
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
  },
  micIcon: {
    width: "13px",
    height: "13px",
    fill: T.accent,
    flexShrink: 0,
  },
};

/* ════════════════════════════════════════
   AI ASSISTANT COMPONENT
════════════════════════════════════════ */
export default function AIAssistant({ moduleText, setAIHandler }) {
  const [response,       setResponse]       = useState("");
  const [loading,        setLoading]        = useState(false);
  const [activeAction,   setActiveAction]   = useState(null); // tracks which btn is active

  /* ── main handler — unchanged logic ── */
  const handleAction = useCallback(async (action) => {
    try {
      if (!moduleText) {
        speak("No module content available");
        return;
      }

      setLoading(true);
      setActiveAction(action);
      speak("Processing, please wait");

      const res = await fetch("http://localhost:5000/api/ai/process", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: moduleText, action }),
      });

      const data = await res.json();
      if (!data.success) throw new Error();

      setResponse(data.data);
      speak(data.data);

    } catch {
      speak("AI request failed. Please try again.");
      setResponse("");
      setActiveAction(null);
    } finally {
      setLoading(false);
    }
  }, [moduleText]);

  /* ── register handler to parent — unchanged ── */
  useEffect(() => {
    if (setAIHandler) setAIHandler(() => handleAction);
  }, [handleAction, setAIHandler]);

  /* ── speak on mount — unchanged ── */
  useEffect(() => {
    const id = setTimeout(() => {
      speak(
        "AI assistant activated. " +
        "Say summarize, explain, example, or back."
      );
    }, 200);
    return () => clearTimeout(id);
  }, []);

  /* ── find the active action config for the response header ── */
  const activeConfig = ACTIONS.find((a) => a.key === activeAction);

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
      `}</style>

      <div style={styles.wrapper}>

        {/* ── Three action buttons ── */}
        <div style={styles.actionRow} role="group" aria-label="AI assistant actions">
          {ACTIONS.map(({ key, label, sub, color, icon }) => {
            const isActive = activeAction === key;
            return (
              <button
                key={key}
                style={styles.actionBtn(color, isActive, loading)}
                onClick={() => !loading && handleAction(key)}
                disabled={loading}
                aria-pressed={isActive}
                aria-label={`${label} — ${sub}`}
              >
                <span style={styles.actionIcon(color, isActive)}>{icon}</span>
                <p style={styles.actionLabel(color, isActive)}>{label}</p>
                <p style={styles.actionSub}>{sub}</p>
              </button>
            );
          })}
        </div>

        {/* ── Loading indicator ── */}
        {loading && (
          <div style={styles.loadingRow} role="status" aria-label="Processing request">
            <div style={styles.loadingDots} aria-hidden="true">
              <div style={styles.dot(0)}   />
              <div style={styles.dot(0.2)} />
              <div style={styles.dot(0.4)} />
            </div>
            <span style={styles.loadingText}>AI is thinking…</span>
          </div>
        )}

        {/* ── Response card — only when there's a response ── */}
        {!loading && response && activeConfig && (
          <div
            style={styles.responseCard(activeConfig.color)}
            role="region"
            aria-label={`${activeConfig.label} result`}
            aria-live="polite"
          >
            {/* Response header */}
            <div style={styles.responseHeader(activeConfig.color)} aria-hidden="true">
              <div style={styles.responseHeaderDot(activeConfig.color)} />
              <p style={styles.responseHeaderLabel(activeConfig.color)}>
                {activeConfig.label}
              </p>
            </div>

            {/* Response text */}
            <p style={styles.responseBody}>{response}</p>
          </div>
        )}

        {/* ── Voice hint ── */}
        <div style={styles.voiceHint} aria-hidden="true">
          <svg style={styles.micIcon} viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.243a.75.75 0 0 1 .736.912A7.003 7.003 0 0 1 12.75 17.92V20h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5v-2.08A7.003 7.003 0 0 1 4.9 11.155a.75.75 0 0 1 1.472-.311A5.5 5.5 0 0 0 17.5 11c0-.072-.002-.144-.006-.215a.75.75 0 0 1 .87-.542z"/>
          </svg>
          Say: summarize · explain · example · back
        </div>

      </div>
    </>
  );
}
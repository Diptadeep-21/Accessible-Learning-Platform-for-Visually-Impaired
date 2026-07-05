import React, { useEffect, useRef } from "react";
import { speak } from "../utils/voiceUtils";

/* ─────────────────────────────────────────
   Design tokens — "Warm Midnight"
   Matched to Home.jsx so the gate and the first real page read as
   one continuous experience. Warm near-black + a single gold accent
   (no secondary hue) still passes WCAG AAA for text contrast.
───────────────────────────────────────── */
const T = {
  bg:        "#15110d",
  surface:   "#1f1912",
  border:    "#332a1f",
  accent:    "#d4a355", // warm gold — primary accent, matches Home's CTA/badge color
  accentAlt: "#c9a05c", // slightly deeper gold for secondary labels
  textPri:   "#f3ead9",
  textSec:   "#c7bcae",
  textMuted: "#8f8575",
  font:      "Georgia, 'Times New Roman', serif",
};

/**
 * Full-screen gate shown before voice control is active.
 * Because browsers require a user gesture before audio can play,
 * this screen has to exist on every load/refresh — so it's designed
 * to make that gesture as easy as possible to discover and perform:
 *  - any keypress, click, OR tap all activate it (not keyboard-only)
 *  - instructions are announced immediately via an assertive live
 *    region, so a screen reader speaks them with no gesture required
 *  - autoFocus + a short aria-label mean a focus-based announcement
 *    also fires, as a fallback in embedded contexts that block audio
 */
const VoiceActivationGate = ({ onActivate }) => {
  const activatedRef = useRef(false);

  useEffect(() => {
    const activate = () => {
      if (activatedRef.current) return;
      activatedRef.current = true;

      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
        oscillator.onended = () => audioCtx.close();
      } catch (err) {
        console.warn("Audio beep failed:", err);
      }

      setTimeout(() => {
        speak(
          "Welcome to the Accessible Learning Platform. " +
            "Voice control is now active. " +
            "To give a command, hold the spacebar and speak. " +
            "Release the spacebar when done. " +
            "Say help at any time to hear available commands."
        );
      }, 350);

      window.removeEventListener("keydown", activate);
      window.removeEventListener("click", activate);
      window.removeEventListener("touchstart", activate);

      onActivate();
    };

    // Keyboard, mouse, AND touch all activate — a blind user on a
    // touchscreen device has no "any key" to press.
    window.addEventListener("keydown", activate);
    window.addEventListener("click", activate);
    window.addEventListener("touchstart", activate);

    return () => {
      window.removeEventListener("keydown", activate);
      window.removeEventListener("click", activate);
      window.removeEventListener("touchstart", activate);
    };
  }, [onActivate]);

  return (
    <div
      role="button"
      tabIndex={0}
      autoFocus
      aria-label="Activate voice control"
      style={styles.page}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
      }}
    >
      <style>{`
        @keyframes alp-ripple {
          0%   { transform: scale(1);   opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes alp-fade {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        .alp-ring { animation: alp-ripple 2.4s ease-out infinite; }
        .alp-ring:nth-child(2) { animation-delay: 0.8s; }
        .alp-ring:nth-child(3) { animation-delay: 1.6s; }
        .alp-cue { animation: alp-fade 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .alp-ring { animation: none; opacity: 0.22; }
          .alp-cue  { animation: none; }
        }
      `}</style>

      {/* Fires immediately for screen readers — no gesture or audio permission needed */}
      <p role="alert" aria-live="assertive" style={styles.srOnly}>
        Accessible Learning Platform. Press any key, or tap or click anywhere, to turn on
        voice control. You will hear a tone, then spoken instructions.
      </p>

      <div style={styles.iconWrap} aria-hidden="true">
        <span className="alp-ring" style={styles.ring} />
        <span className="alp-ring" style={styles.ring} />
        <span className="alp-ring" style={styles.ring} />
        <div style={styles.iconCore}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke={T.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 010 7" />
            <path d="M18.5 6a9 9 0 010 12" />
          </svg>
        </div>
      </div>

      <p style={styles.eyebrow} aria-hidden="true">Voice-controlled learning</p>
      <h1 style={styles.title} aria-hidden="true">Accessible Learning Platform</h1>
      <p style={styles.subtitle} aria-hidden="true">Built for visually impaired students</p>

      <div style={styles.cueBox} aria-hidden="true">
        <p className="alp-cue" style={styles.cueText}>
          Press any key — or tap anywhere — to begin
        </p>
      </div>

      <p style={styles.footnote} aria-hidden="true">
        You'll hear a short tone, then instructions for navigating by voice.
      </p>
    </div>
  );
};

const styles = {
  page: {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: "32px",
    background: T.bg,
    color: T.textPri,
    fontFamily: T.font,
    textAlign: "center",
    cursor: "pointer",
    outline: "none",
    boxSizing: "border-box",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },

  iconWrap: {
    position: "relative",
    width: "96px",
    height: "96px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "22px",
  },
  ring: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: `2px solid ${T.accent}`,
  },
  iconCore: {
    position: "relative",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: T.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: `0 0 0 1px ${T.border}, 0 10px 30px rgba(212,163,85,0.25)`,
  },

  eyebrow: {
    fontSize: "12.5px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: T.accentAlt,
    margin: 0,
  },
  title: {
    fontSize: "clamp(28px, 5vw, 44px)",
    fontWeight: 800,
    margin: "8px 0 0",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "15px",
    color: T.textSec,
    margin: "8px 0 28px",
  },

  cueBox: {
    border: `1px solid ${T.border}`,
    background: T.surface,
    borderRadius: "999px",
    padding: "14px 28px",
  },
  cueText: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: T.textPri,
  },

  footnote: {
    fontSize: "13px",
    color: T.textMuted,
    marginTop: "22px",
    maxWidth: "360px",
    lineHeight: 1.6,
  },
};

export default VoiceActivationGate;
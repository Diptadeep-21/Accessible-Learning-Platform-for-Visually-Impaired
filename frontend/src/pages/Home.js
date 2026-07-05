import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { speak } from "../utils/voiceUtils";

/* =====================================================================
   DESIGN TOKENS — "Warm Midnight"
   ---------------------------------------------------------------------
   Warm near-black background, single gold accent (no secondary hue),
   humanist serif type. Swapped in to replace the previous blue/amber
   Inter-based theme.
   ===================================================================== */
const T = {
  bg:        "#15110d", // page background — warm near-black
  surface:   "#1f1912", // card / panel background
  surfaceHi: "#241d15", // badges, hovered surfaces
  border:    "#332a1f",
  accent:    "#d4a355", // warm gold — primary actions & highlights
  accentDim: "#c9a05c",
  success:   "#5ec98f", // status dot
  textPri:   "#f3ead9", // cream
  textSec:   "#c7bcae", // muted warm light
  textMuted: "#8f8575", // muted warm grey
  font:      "Georgia, 'Times New Roman', serif",
};

const COMMANDS = [
  { word: "start learning", desc: "opens your course list" },
  { word: "login", desc: "go to the login page" },
  { word: "register", desc: "create an account" },
  { word: "help", desc: "hear all commands" },
];

const MicIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <path d="M12 19v4M8 23h8" />
  </svg>
);

/* Animated waveform — single gold gradient, no secondary hue, so it
   reads as one calm accent rather than two competing colors. */
const Waveform = () => {
  const bars = 26;
  return (
    <svg viewBox="0 0 320 200" className="w-full max-w-md" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="barGradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={T.accentDim} />
          <stop offset="100%" stopColor={T.accent} stopOpacity="0.55" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={T.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="160" cy="100" r="95" fill="url(#glow)" />

      {Array.from({ length: bars }).map((_, i) => {
        const x = 10 + i * (300 / bars);
        const baseHeight = 20 + Math.abs(Math.sin(i * 0.9)) * 90;
        const delay = (i % 7) * 0.09;
        const dur = 0.9 + (i % 5) * 0.12;
        return (
          <rect
            key={i}
            x={x}
            width={300 / bars - 3}
            y={100 - baseHeight / 2}
            height={baseHeight}
            rx={2.5}
            fill="url(#barGradient)"
            style={{
              transformOrigin: "160px 100px",
              animation: `wavePulse ${dur}s ease-in-out ${delay}s infinite`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes wavePulse {
          0%, 100% { transform: scaleY(0.45); opacity: 0.7; }
          50%      { transform: scaleY(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          rect { animation: none !important; transform: scaleY(0.8) !important; }
        }
      `}</style>
    </svg>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Guest";

  useEffect(() => {
    speak(
      "Welcome to Accessible Learning Platform. Say start learning, login, or register."
    );
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: T.bg, color: T.textPri, fontFamily: T.font }}
    >
      {/* ── header ── */}
      <div
        className="flex items-center justify-between px-8 sm:px-16 py-5"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <p
          className="text-xs font-bold"
          style={{ color: T.accent, letterSpacing: "0.16em" }}
        >
          ACCESSIBLE LEARNING
        </p>
        <div className="flex items-center gap-2 text-sm" style={{ color: T.textSec }}>
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: T.success, boxShadow: `0 0 6px ${T.success}` }}
            aria-hidden="true"
          />
          {username}
        </div>
      </div>

      {/* ── body ── */}
      <div className="grid md:grid-cols-2 flex-1">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center px-8 sm:px-16 py-14">
          <p
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-6 w-fit"
            style={{
              background: T.surfaceHi,
              border: `1px solid ${T.border}`,
              color: T.accent,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            Designed for accessibility
          </p>

          <h1
            className="mb-6"
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            Empowering Minds.
            <br />
            <span style={{ color: T.accent }}>Enabling Futures.</span>
          </h1>

          <p className="mb-9 max-w-lg text-base leading-relaxed" style={{ color: T.textSec }}>
            An AI-powered learning platform for visually impaired students.
            Navigate using voice and learn through audio-based content.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => navigate("/courses")}
              className="px-7 py-3.5 rounded-full text-base font-bold transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: T.accent,
                color: T.bg,
                fontFamily: T.font,
                boxShadow: "0 10px 26px rgba(212,163,85,0.25)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Start Learning
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-7 py-3.5 rounded-full text-base font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.textPri,
                fontFamily: T.font,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = T.surfaceHi;
                e.currentTarget.style.borderColor = T.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = T.border;
              }}
            >
              Login
            </button>
          </div>

          {/* Spoken command reference */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 max-w-lg"
            style={{ borderTop: `1px solid ${T.border}` }}
          >
            {COMMANDS.map((c) => (
              <div key={c.word} className="flex items-baseline gap-2 text-sm">
                <span style={{ color: T.accent, fontWeight: 700 }}>"{c.word}"</span>
                <span style={{ color: T.textMuted }}>— {c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — waveform */}
        <div
          className="hidden md:flex items-center justify-center px-16 py-14"
          style={{ borderLeft: `1px solid ${T.border}` }}
        >
          <Waveform />
        </div>
      </div>

      {/* ── footer ── */}
      <div
        className="flex items-center gap-2 px-8 sm:px-16 py-4 text-sm"
        style={{ borderTop: `1px solid ${T.border}`, color: T.textMuted }}
      >
        <MicIcon className="h-4 w-4" style={{ color: T.accent }} aria-hidden="true" />
        Hold spacebar · speak command · release
      </div>

      {/* Hidden accessibility instructions */}
      <div className="sr-only">
        Press spacebar and speak commands like start learning, login, or register.
      </div>
    </div>
  );
};

export default Home;
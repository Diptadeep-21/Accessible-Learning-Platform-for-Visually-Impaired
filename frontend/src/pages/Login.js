import React, { useRef, useEffect, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { speak } from "../utils/voiceUtils";

/* ─────────────────────────────────────────
   Design tokens — one place to change them
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

const styles = {
  page: {
    minHeight: "100vh",
    background: T.bg,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: T.font,
    padding: "24px",
    color: T.textPri,
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "20px",
    padding: "40px 36px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  header: {
    textAlign: "center",
  },
  logo: {
    fontSize: "13px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: T.accent,
    fontWeight: 600,
    marginBottom: "12px",
  },
  title: {
    fontSize: "26px",
    fontWeight: 700,
    color: T.textPri,
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: T.textSec,
    marginTop: "6px",
  },
  /* ── role toggle ── */
  roleRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    background: "#f8f9fc",
    borderRadius: T.radius,
    padding: "5px",
  },
  roleBtn: (active) => ({
    padding: "10px",
    borderRadius: "9px",
    border: "none",
    fontFamily: T.font,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    background: active ? T.accent : "transparent",
    color: active ? "#ffffff" : T.textSec,
    outline: "none",
  }),
  /* ── step badge ── */
  stepBadge: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f8f9fc",
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "12px 16px",
    fontSize: "14px",
    color: T.textSec,
    minHeight: "46px",
  },
  dot: (color) => ({
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
    boxShadow: `0 0 6px ${color}`,
  }),
  stepText: {
    fontWeight: 500,
    color: T.textPri,
    fontSize: "14px",
  },
  /* ── confirm box ── */
  confirmBox: {
    background: "#f8f9fc",
    border: `1px solid ${T.accentDim}`,
    borderRadius: T.radius,
    padding: "16px",
    textAlign: "center",
  },
  confirmName: {
    fontSize: "22px",
    fontWeight: 700,
    color: T.accent,
    letterSpacing: "0.04em",
  },
  confirmHint: {
    fontSize: "13px",
    color: T.textSec,
    marginTop: "6px",
  },
  keyHint: {
    display: "inline-block",
    background: T.border,
    color: T.textPri,
    borderRadius: "5px",
    padding: "1px 7px",
    fontFamily: "monospace",
    fontSize: "13px",
    fontWeight: 700,
  },
  /* ── video ── */
  videoWrap: {
    position: "relative",
    borderRadius: T.radius,
    overflow: "hidden",
    border: `2px solid ${T.border}`,
    background: "#000",
    lineHeight: 0,
  },
  video: {
    width: "100%",
    display: "block",
    borderRadius: T.radius,
  },
  scanOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(108,99,255,0.12)",
    pointerEvents: "none",
  },
  scanText: {
    background: "rgba(0,0,0,0.65)",
    color: T.accent,
    fontSize: "13px",
    fontWeight: 600,
    padding: "6px 14px",
    borderRadius: "20px",
    letterSpacing: "0.05em",
  },
  /* ── teacher form ── */
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: T.textSec,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  input: {
    padding: "12px 14px",
    background: "#f8f9fc",
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    color: T.textPri,
    fontSize: "15px",
    fontFamily: T.font,
    outline: "none",
    transition: "border-color 0.2s",
  },
  /* ── primary button ── */
  btn: (loading) => ({
    padding: "13px",
    background: loading ? T.accentDim : T.accent,
    color: "#ffffff",
    border: "none",
    borderRadius: T.radius,
    fontSize: "15px",
    fontWeight: 700,
    fontFamily: T.font,
    cursor: loading ? "not-allowed" : "pointer",
    letterSpacing: "0.02em",
    transition: "background 0.2s, transform 0.1s",
  }),
  /* ── voice hint footer ── */
  voiceHint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "12px",
    color: T.textSec,
    paddingTop: "4px",
    borderTop: `1px solid ${T.border}`,
  },
  micIcon: {
    width: "14px",
    height: "14px",
    fill: T.accent,
  },
};

/* ─────────────────────────────────────────
   Step config — single source of truth for
   what colour and label each step shows
───────────────────────────────────────── */
const STEP_META = {
  welcome:   { color: T.textSec,  label: "Hold spacebar and say your username" },
  confirm:   { color: "#f59e0b",  label: "Confirm your username below" },
  camera:    { color: "#f59e0b",  label: "Say start camera to continue" },
  ready:     { color: T.success,  label: "Camera ready — press Enter to scan" },
  scanning:  { color: T.accent,   label: "Scanning… stay still" },
};

/* ════════════════════════════════════════
   LOGIN COMPONENT
════════════════════════════════════════ */
const Login = ({ setIsLoggedIn }) => {
  const videoRef = useRef();
  const navigate = useNavigate();

  const [role, setRole]       = useState("student");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [uiStep, setUiStep]   = useState("welcome");
  const [loading, setLoading] = useState(false);

  const state = useRef({ step: "welcome", username: "" });

  const setStep = (step) => {
    state.current.step = step;
    setUiStep(step);
  };

  /* ── focus input styling ── */
  const handleFocus  = (e) => { e.target.style.borderColor = T.accent; };
  const handleBlur   = (e) => { e.target.style.borderColor = T.border; };

  /* ─────────── startCamera ─────────── */
  const startCamera = useCallback(async () => {
    speak("Starting your camera.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      setStep("ready");
    } catch {
      speak("Camera error. Please allow camera permission and try again.");
      setStep("welcome");
    }
  }, []);

  /* ─────────── handleStudentLogin ─────────── */
  const handleStudentLogin = useCallback(async () => {
    setLoading(true);
    const username = state.current.username;
    try {
      let detection = null;
      for (let i = 0; i < 8; i++) {
        detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection) break;
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!detection) {
        speak("No face detected. Press Enter to try again.");
        setStep("ready");
        setLoading(false);
        return;
      }
      const descriptor = Array.from(detection.descriptor);
      const res = await axios.post("http://localhost:5000/api/auth/face-login", {
        username,
        faceDescriptor: descriptor,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role || "student");
        localStorage.setItem("username", res.data.username);
        speak(`Login successful`, () => {
          setIsLoggedIn(true);
          navigate("/courses");
        });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "";
      if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("not recognized")) {
        speak("Face not recognized. Make sure your face is well lit and press Enter to try again.");
      } else {
        speak("Login failed. Press Enter to try again.");
      }
      setStep("ready");
    }
    setLoading(false);
  }, [navigate, setIsLoggedIn]);

  /* ─────────── speak on step change ─────────── */
  useEffect(() => {
    if (role !== "student") return;
    const step = state.current.step;
    if (step === "welcome")  speak("Welcome. Hold the spacebar and say your username.");
    if (step === "confirm")  speak(`I heard ${state.current.username}. Press 1 to confirm or 2 to retry.`);
    if (step === "camera")   speak("Username confirmed. Say start camera to turn on your camera.");
    if (step === "ready")    speak("Camera is active. Press Enter to scan your face.");
    if (step === "scanning") speak("Scanning. Please stay still.");
  }, [uiStep, role]);

  /* ─────────── voice commands ─────────── */
  useEffect(() => {
    if (role !== "student") return;
    const listener = (e) => {
      const cmd  = (e.detail || "").trim().toLowerCase();
      const step = state.current.step;
      if (step === "welcome") {
        if (!cmd) return speak("Say your username.");
        e.preventDefault();
        state.current.username = cmd;
        setStep("confirm");
        return;
      }
      if (step === "camera") {
        e.preventDefault();
        if (cmd.includes("start camera")) startCamera();
        else speak("Say start camera to continue.");
      }
    };
    window.addEventListener("voiceCommand", listener);
    return () => window.removeEventListener("voiceCommand", listener);
  }, [role, startCamera]);

  /* ─────────── keyboard ─────────── */
  useEffect(() => {
    if (role !== "student") return;
    const handler = (e) => {
      const step = state.current.step;
      if (step === "confirm") {
        if (e.key === "1") setStep("camera");
        if (e.key === "2") { state.current.username = ""; setStep("welcome"); }
      }
      if (step === "ready" && e.key === "Enter") {
        setStep("scanning");
        handleStudentLogin();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [role, handleStudentLogin]);

  /* ─────────── teacher login ─────────── */
  const handleTeacherLogin = async () => {
    if (!email || !password) { alert("Email and password required"); return; }
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      setIsLoggedIn(true);
      if (res.data.role === "admin") navigate("/admin-dashboard");
      else if (res.data.role === "teacher") navigate("/teacher-dashboard");
      else navigate("/courses");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ─────────── derived UI state ─────────── */
  const stepMeta = STEP_META[uiStep] || STEP_META.welcome;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div style={styles.page}>
      <main style={styles.card} role="main" aria-label="Login page">

        {/* Header */}
        <header style={styles.header}>
          <p style={styles.logo} aria-hidden="true">Accessible Learning</p>
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.subtitle}>
            {role === "student"
              ? "Voice + face recognition for students"
              : "Email and password for teachers"}
          </p>
        </header>

        {/* Role toggle */}
        <div
          style={styles.roleRow}
          role="group"
          aria-label="Select your role"
        >
          <button
            style={styles.roleBtn(role === "student")}
            onClick={() => { setRole("student"); setStep("welcome"); }}
            aria-pressed={role === "student"}
          >
            Student
          </button>
          <button
            style={styles.roleBtn(role === "teacher")}
            onClick={() => setRole("teacher")}
            aria-pressed={role === "teacher"}
          >
            Teacher
          </button>
        </div>

        {/* ── STUDENT FLOW ── */}
        {role === "student" && (
          <>
            {/* Step status badge */}
            <div
              style={styles.stepBadge}
              role="status"
              aria-live="polite"
              aria-label={`Current step: ${stepMeta.label}`}
            >
              <span style={styles.dot(stepMeta.color)} aria-hidden="true" />
              <span style={styles.stepText}>{stepMeta.label}</span>
            </div>

            {/* Confirm box — only when name is heard */}
            {uiStep === "confirm" && (
              <div style={styles.confirmBox} role="alert" aria-live="assertive">
                <p style={{ color: T.textSec, fontSize: "13px", margin: "0 0 6px" }}>
                  Username heard
                </p>
                <p style={styles.confirmName}>{state.current.username}</p>
                <p style={styles.confirmHint}>
                  Press <span style={styles.keyHint}>1</span> to confirm &nbsp;·&nbsp;
                  <span style={styles.keyHint}>2</span> to retry
                </p>
              </div>
            )}

            {/* Camera + scan overlay */}
            {(uiStep === "camera" || uiStep === "ready" || uiStep === "scanning") && (
              <div style={styles.videoWrap}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={styles.video}
                  aria-label="Camera feed for face recognition"
                />
                {uiStep === "scanning" && (
                  <div style={styles.scanOverlay} aria-hidden="true">
                    <span style={styles.scanText}>SCANNING…</span>
                  </div>
                )}
              </div>
            )}

            {/* Voice hint */}
            <div style={styles.voiceHint} aria-hidden="true">
              <svg style={styles.micIcon} viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.243a.75.75 0 0 1 .736.912A7.003 7.003 0 0 1 12.75 17.92V20h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5v-2.08A7.003 7.003 0 0 1 4.9 11.155a.75.75 0 0 1 1.472-.311A5.5 5.5 0 0 0 17.5 11c0-.072-.002-.144-.006-.215a.75.75 0 0 1 .87-.542z"/>
              </svg>
              Hold spacebar to speak a command
            </div>
          </>
        )}

        {/* ── TEACHER FLOW ── */}
        {role === "teacher" && (
          <>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="teacher@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={styles.input}
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={styles.input}
                autoComplete="current-password"
                aria-required="true"
              />
            </div>

            <button
              style={styles.btn(loading)}
              onClick={handleTeacherLogin}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Signing in…" : "Sign in as Teacher"}
            </button>
          </>
        )}

      </main>
    </div>
  );
};

export default Login;
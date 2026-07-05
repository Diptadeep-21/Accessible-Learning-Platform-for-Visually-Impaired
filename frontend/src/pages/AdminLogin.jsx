import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────
   Design tokens — Admin Portal (dark, intentionally
   distinct from the Soft White teacher/student theme)
───────────────────────────────────────── */
const T = {
  bg:        "#0d0e14",
  bgGlow:    "#171933",
  surface:   "#15161f",
  surfaceHi: "#1c1e2b",
  border:    "#282b3a",
  borderHi:  "#5b52e8",
  accent:    "#7c72f5",
  accentDim: "#5b52e8",
  danger:    "#f87171",
  textPri:   "#f3f4f6",
  textSec:   "#9099b0",
  textMuted: "#5c6178",
  radius:    "14px",
  font:      "'Inter', 'Segoe UI', sans-serif",
};

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a20.3 20.3 0 015.06-6.06M9.9 4.24A10.44 10.44 0 0112 4c7 0 11 8 11 8a20.3 20.3 0 01-2.68 3.9M14.12 14.12a3 3 0 11-4.24-4.24" />
        <path d="M1 1l22 22" />
      </>
    )}
  </svg>
);

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/teacher-login",
        { email, password }
      );

      if (res.data.role !== "admin") {
        setError("This account is not authorized as admin.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);

      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes adminSpin { to { transform: rotate(360deg); } }
        .admin-field { transition: border-color 0.15s, box-shadow 0.15s, background 0.15s; }
        .admin-field:focus {
          outline: none;
          border-color: ${T.accent} !important;
          box-shadow: 0 0 0 3px ${T.accentDim}2e;
          background: ${T.surfaceHi} !important;
        }
        .admin-toggle:hover { color: ${T.textPri}; }
        .admin-submit:hover:not(:disabled) { background: #6a60f0; }
        .admin-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin-spinner {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          animation: adminSpin 0.7s linear infinite;
        }
      `}</style>

      {/* ambient background */}
      <div style={styles.glow} aria-hidden="true" />
      <div style={styles.grid} aria-hidden="true" />

      <div style={styles.card}>
        <div style={styles.lockBadge} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 018 0v3" />
          </svg>
        </div>

        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.subtitle}>Restricted access — administrators only</p>

        {error && (
          <div style={styles.errorBanner} role="alert">
            <span style={styles.errorDot} aria-hidden="true" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="admin-email">Admin email</label>
            <input
              id="admin-email"
              className="admin-field"
              style={styles.input}
              type="email"
              placeholder="you@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="admin-password">Password</label>
            <div style={styles.passwordWrap}>
              <input
                id="admin-password"
                className="admin-field"
                style={styles.inputWithIcon}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-toggle"
                style={styles.eyeButton}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-spinner" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              "Sign in to admin"
            )}
          </button>
        </form>

        <p style={styles.footnote}>
          Access is logged and monitored. Contact IT if you believe you've
          reached this page in error.
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: T.bg,
    fontFamily: T.font,
    overflow: "hidden",
    padding: "24px",
    boxSizing: "border-box",
  },

  glow: {
    position: "absolute",
    top: "-20%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "700px",
    height: "700px",
    background: `radial-gradient(circle, ${T.bgGlow}70 0%, transparent 65%)`,
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      `linear-gradient(${T.border}40 1px, transparent 1px), linear-gradient(90deg, ${T.border}40 1px, transparent 1px)`,
    backgroundSize: "42px 42px",
    maskImage: "radial-gradient(circle at 50% 30%, #000 0%, transparent 70%)",
    WebkitMaskImage: "radial-gradient(circle at 50% 30%, #000 0%, transparent 70%)",
    pointerEvents: "none",
  },

  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "380px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "36px 32px 28px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
  },

  lockBadge: {
    width: "42px",
    height: "42px",
    borderRadius: "11px",
    background: `${T.accentDim}22`,
    border: `1px solid ${T.accentDim}45`,
    color: T.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
  },

  title: {
    fontSize: "19px",
    fontWeight: 700,
    color: T.textPri,
    margin: "0 0 4px",
    letterSpacing: "-0.01em",
  },
  subtitle: {
    fontSize: "12.5px",
    color: T.textMuted,
    margin: "0 0 24px",
  },

  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: `${T.danger}14`,
    border: `1px solid ${T.danger}35`,
    color: T.danger,
    padding: "10px 13px",
    borderRadius: "9px",
    fontSize: "12.5px",
    fontWeight: 500,
    marginBottom: "18px",
  },
  errorDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: T.danger,
    flexShrink: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
  },

  label: {
    fontSize: "12px",
    fontWeight: 600,
    color: T.textSec,
    marginBottom: "7px",
  },

  input: {
    padding: "11px 13px",
    borderRadius: "9px",
    border: `1px solid ${T.border}`,
    background: T.bg,
    color: T.textPri,
    fontSize: "13.5px",
    fontFamily: T.font,
  },

  passwordWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputWithIcon: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 40px 11px 13px",
    borderRadius: "9px",
    border: `1px solid ${T.border}`,
    background: T.bg,
    color: T.textPri,
    fontSize: "13.5px",
    fontFamily: T.font,
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    background: "transparent",
    border: "none",
    color: T.textMuted,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    transition: "color 0.15s",
  },

  submitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    border: "none",
    borderRadius: "9px",
    background: T.accentDim,
    color: "#fff",
    fontWeight: 700,
    fontSize: "13.5px",
    fontFamily: T.font,
    cursor: "pointer",
    transition: "background 0.15s",
  },

  footnote: {
    fontSize: "11px",
    color: T.textMuted,
    lineHeight: 1.5,
    textAlign: "center",
    marginTop: "22px",
    marginBottom: 0,
  },
};

export default AdminLogin;
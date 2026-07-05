import React, { useEffect, useState } from "react";
import axios from "axios";

/* ─────────────────────────────────────────
   Design tokens — Admin Portal (dark, matches AdminLogin)
───────────────────────────────────────── */
const T = {
  bg:        "#0d0e14",
  surface:   "#15161f",
  surfaceHi: "#1c1e2b",
  border:    "#282b3a",
  accent:    "#7c72f5",
  accentDim: "#5b52e8",
  success:   "#4ade80",
  danger:    "#f87171",
  textPri:   "#f3f4f6",
  textSec:   "#9099b0",
  textMuted: "#5c6178",
  radius:    "12px",
  font:      "'Inter', 'Segoe UI', sans-serif",
};

const ApproveQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState("");

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API}/api/quizzes/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setQuizzes(res.data);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Couldn't load pending quizzes. Try refreshing.");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      setApprovingId(id);

      await axios.put(
        `${process.env.REACT_APP_API}/api/quizzes/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Error approving quiz:", err);
      setError("Approval failed. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} aria-hidden="true" />
        <p style={styles.loadingText}>Loading pending quizzes…</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .approve-card { transition: border-color 0.15s, background 0.15s; }
        .approve-card:hover { border-color: ${T.accentDim}55; background: ${T.surfaceHi}; }
        .approve-btn { transition: background 0.15s; }
        .approve-btn:hover:not(:disabled) { background: #3fbf72; }
        .approve-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={styles.headerRow}>
        <h3 style={styles.heading}>Pending quiz approvals</h3>
        {quizzes.length > 0 && (
          <span style={styles.countPill}>{quizzes.length} pending</span>
        )}
      </div>

      {error && (
        <div style={styles.errorBanner} role="alert">
          <span style={styles.errorDot} aria-hidden="true" />
          {error}
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h4 style={styles.emptyTitle}>All caught up</h4>
          <p style={styles.emptyText}>There are no quizzes waiting for review.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {quizzes.map((quiz) => (
            <div key={quiz._id} style={styles.card} className="approve-card">
              <div style={styles.cardMain}>
                <div style={styles.cardTop}>
                  <h4 style={styles.cardTitle}>{quiz.title}</h4>
                  <span style={styles.pendingTag}>Pending review</span>
                  {Array.isArray(quiz.questions) && (
                    <span style={styles.countTag}>
                      {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <p style={styles.cardDesc}>{quiz.description}</p>

                <div style={styles.teacherRow}>
                  <span style={styles.teacherAvatar} aria-hidden="true">
                    {(quiz.teacher?.username || "?").charAt(0).toUpperCase()}
                  </span>
                  <span style={styles.teacherText}>
                    Submitted by{" "}
                    <strong style={styles.teacherName}>
                      {quiz.teacher?.username || "Unknown"}
                    </strong>
                  </span>
                </div>
              </div>

              <button
                style={styles.approveBtn}
                className="approve-btn"
                onClick={() => approve(quiz._id)}
                disabled={approvingId === quiz._id}
              >
                {approvingId === quiz._id ? "Approving…" : "Approve"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { fontFamily: T.font },

  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "70px 0",
  },
  spinner: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: `3px solid ${T.border}`,
    borderTopColor: T.accent,
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: "13px", color: T.textMuted, margin: 0 },

  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
  },
  heading: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: T.textMuted,
    margin: 0,
  },
  countPill: {
    fontSize: "11px",
    fontWeight: 700,
    color: T.accent,
    background: `${T.accentDim}20`,
    border: `1px solid ${T.accentDim}40`,
    borderRadius: "10px",
    padding: "2px 9px",
  },

  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: `${T.danger}14`,
    border: `1px solid ${T.danger}35`,
    color: T.danger,
    padding: "10px 14px",
    borderRadius: "9px",
    fontSize: "12.5px",
    fontWeight: 500,
    marginBottom: "16px",
  },
  errorDot: { width: "6px", height: "6px", borderRadius: "50%", background: T.danger, flexShrink: 0 },

  emptyCard: {
    background: T.surfaceHi,
    border: `1px dashed ${T.border}`,
    borderRadius: T.radius,
    padding: "44px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: `${T.success}18`,
    border: `1px solid ${T.success}35`,
    color: T.success,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  emptyTitle: { fontSize: "14px", fontWeight: 700, color: T.textPri, margin: "0 0 4px" },
  emptyText: { fontSize: "12.5px", color: T.textMuted, margin: 0 },

  list: { display: "flex", flexDirection: "column", gap: "12px" },

  card: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "18px 20px",
  },
  cardMain: { flex: 1, minWidth: "260px" },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "6px",
  },
  cardTitle: { fontSize: "14.5px", fontWeight: 700, color: T.textPri, margin: 0 },
  pendingTag: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#facc15",
    background: "#facc1518",
    border: "1px solid #facc1535",
    borderRadius: "8px",
    padding: "2px 8px",
  },
  countTag: {
    fontSize: "11px",
    fontWeight: 600,
    color: T.textMuted,
    background: T.surfaceHi,
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    padding: "2px 8px",
  },
  cardDesc: {
    fontSize: "13px",
    color: T.textSec,
    margin: "0 0 12px",
    lineHeight: 1.5,
  },

  teacherRow: { display: "flex", alignItems: "center", gap: "8px" },
  teacherAvatar: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: `${T.accentDim}30`,
    color: T.accent,
    fontSize: "10.5px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  teacherText: { fontSize: "12px", color: T.textMuted },
  teacherName: { color: T.textSec },

  approveBtn: {
    padding: "10px 20px",
    background: T.success,
    color: "#0d0e14",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
    fontFamily: T.font,
    flexShrink: 0,
  },
};

export default ApproveQuizzes;
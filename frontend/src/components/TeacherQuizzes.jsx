import React, { useEffect, useState } from "react";
import axios from "axios";

/* ─────────────────────────────────────────
   Design tokens — Soft White (matches dashboard)
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

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/quizzes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await axios.delete(`http://localhost:5000/api/quizzes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setQuizzes(quizzes.filter((quiz) => quiz._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} aria-hidden="true" />
        <p style={styles.loadingText}>Loading quizzes…</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        .quiz-card { transition: box-shadow 0.15s, border-color 0.15s; }
        .quiz-card:hover { border-color: ${T.accentDim}; box-shadow: 0 4px 14px rgba(17,24,39,0.06); }
        .quiz-delete-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .quiz-delete-btn:hover { background: ${T.danger}12; border-color: ${T.danger}55; color: ${T.danger}; }
        .quiz-delete-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {quizzes.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No quizzes yet</h3>
          <p style={styles.emptyText}>Quizzes you upload will appear here once created.</p>
        </div>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz._id} style={styles.card} className="quiz-card">
            <div style={styles.header}>
              <div style={styles.headerText}>
                <h3 style={styles.cardTitle}>{quiz.title}</h3>
                <p style={styles.cardDesc}>{quiz.description}</p>

                <div style={styles.metaRow}>
                  <span style={styles.metaTag}>
                    <strong style={styles.metaLabel}>Course</strong>
                    {quiz.course?.title || "No course"}
                  </span>
                  <span style={styles.metaTag}>
                    <strong style={styles.metaLabel}>Questions</strong>
                    {quiz.questions.length}
                  </span>
                </div>
              </div>

              <div>
                {quiz.isApproved ? (
                  <span style={styles.approved}>
                    <span style={styles.dot(T.success)} aria-hidden="true" />
                    Approved
                  </span>
                ) : (
                  <span style={styles.pending}>
                    <span style={styles.dot(T.warning)} aria-hidden="true" />
                    Pending approval
                  </span>
                )}
              </div>
            </div>

            <div style={styles.divider} />

            <h4 style={styles.sectionLabel}>Questions</h4>

            <div style={styles.questionList}>
              {quiz.questions.map((question, index) => (
                <div key={index} style={styles.questionBox}>
                  <p style={styles.questionText}>
                    <span style={styles.qIndex}>Q{index + 1}</span>
                    {question.question}
                  </p>

                  <ul style={styles.list}>
                    {question.options.map((option, i) => {
                      const isAnswer = option === question.answer;
                      return (
                        <li
                          key={i}
                          style={isAnswer ? styles.optionCorrect : styles.optionItem}
                        >
                          {option}
                          {isAnswer && <span style={styles.checkIcon}>✓</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <button
              style={styles.deleteButton}
              className="quiz-delete-btn"
              onClick={() => deleteQuiz(quiz._id)}
              disabled={deletingId === quiz._id}
            >
              {deletingId === quiz._id ? "Deleting…" : "Delete quiz"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    fontFamily: T.font,
  },

  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "80px 0",
  },
  spinner: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: `3px solid ${T.border}`,
    borderTopColor: T.accent,
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: "13px",
    color: T.textSec,
    margin: 0,
  },

  emptyCard: {
    background: T.surfaceHi,
    border: `1px dashed ${T.border}`,
    padding: "48px 24px",
    borderRadius: T.radius,
    textAlign: "center",
  },
  emptyIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: T.danger + "14",
    border: `1px solid ${T.danger}25`,
    color: T.danger,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: T.textPri,
    margin: "0 0 4px",
  },
  emptyText: {
    fontSize: "13px",
    color: T.textSec,
    margin: 0,
  },

  card: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    padding: "24px",
    borderRadius: T.radius,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
  },
  headerText: { flex: 1, minWidth: "220px" },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: T.textPri,
    margin: "0 0 6px",
  },
  cardDesc: {
    fontSize: "13px",
    color: T.textSec,
    margin: "0 0 12px",
    lineHeight: 1.5,
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  metaTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: T.textSec,
    background: T.surfaceHi,
    border: `1px solid ${T.border}`,
    padding: "5px 10px",
    borderRadius: "8px",
  },
  metaLabel: {
    color: T.textMuted,
    fontWeight: 600,
  },

  approved: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: T.success + "14",
    color: T.success,
    border: `1px solid ${T.success}30`,
    padding: "6px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  pending: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: T.warning + "14",
    color: T.warning,
    border: `1px solid ${T.warning}30`,
    padding: "6px 13px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  dot: (color) => ({
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: color,
  }),

  divider: {
    height: "1px",
    background: T.border,
    margin: "20px 0 16px",
  },

  sectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: T.textMuted,
    margin: "0 0 12px",
  },

  questionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  questionBox: {
    background: T.surfaceHi,
    padding: "16px",
    borderRadius: "10px",
    border: `1px solid ${T.border}`,
  },
  questionText: {
    fontSize: "13px",
    color: T.textPri,
    margin: "0 0 10px",
    lineHeight: 1.5,
    display: "flex",
    gap: "8px",
  },
  qIndex: {
    flexShrink: 0,
    fontWeight: 700,
    color: T.accent,
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  optionItem: {
    fontSize: "12.5px",
    color: T.textSec,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "7px",
    padding: "7px 12px",
  },
  optionCorrect: {
    fontSize: "12.5px",
    color: T.success,
    background: T.success + "10",
    border: `1px solid ${T.success}35`,
    borderRadius: "7px",
    padding: "7px 12px",
    fontWeight: 600,
    display: "flex",
    justifyContent: "space-between",
  },
  checkIcon: {
    color: T.success,
    fontWeight: 700,
  },

  deleteButton: {
    marginTop: "20px",
    padding: "9px 16px",
    border: `1px solid ${T.border}`,
    borderRadius: "9px",
    background: T.surface,
    color: T.danger,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
    fontFamily: T.font,
  },
};

export default TeacherQuizzes;
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

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API}/api/courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCourses(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await axios.delete(`${process.env.REACT_APP_API}/api/courses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCourses(courses.filter((course) => course._id !== id));
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
        <p style={styles.loadingText}>Loading courses…</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        .course-card { transition: box-shadow 0.15s, border-color 0.15s; }
        .course-card:hover { border-color: ${T.accentDim}; box-shadow: 0 4px 14px rgba(17,24,39,0.06); }
        .course-delete-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; }
        .course-delete-btn:hover { background: ${T.danger}12; border-color: ${T.danger}55; color: ${T.danger}; }
        .course-delete-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {courses.length === 0 ? (
        <div style={styles.emptyCard}>
          <div style={styles.emptyIcon} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No courses yet</h3>
          <p style={styles.emptyText}>Courses you upload will appear here once created.</p>
        </div>
      ) : (
        courses.map((course) => (
          <div key={course._id} style={styles.card} className="course-card">
            <div style={styles.header}>
              <div style={styles.headerText}>
                <h3 style={styles.cardTitle}>{course.title}</h3>
                <p style={styles.cardDesc}>{course.description}</p>

                <div style={styles.metaRow}>
                  <span style={styles.metaTag}>
                    <strong style={styles.metaLabel}>Category</strong>
                    {course.category || "Not specified"}
                  </span>
                  <span style={styles.metaTag}>
                    <strong style={styles.metaLabel}>Difficulty</strong>
                    {course.difficulty || "Not specified"}
                  </span>
                </div>
              </div>

              <div>
                {course.isApproved ? (
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

            <h4 style={styles.sectionLabel}>Modules</h4>

            {course.modules && course.modules.length > 0 ? (
              <div style={styles.moduleList}>
                {course.modules.map((module, index) => (
                  <div key={index} style={styles.moduleBox}>
                    <span style={styles.moduleIndex}>{index + 1}</span>
                    <p style={styles.moduleText}>{module}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.noModules}>No modules available.</p>
            )}

            <button
              style={styles.deleteButton}
              className="course-delete-btn"
              onClick={() => deleteCourse(course._id)}
              disabled={deletingId === course._id}
            >
              {deletingId === course._id ? "Deleting…" : "Delete course"}
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
    background: T.accent + "14",
    border: `1px solid ${T.accent}25`,
    color: T.accent,
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

  moduleList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  moduleBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    background: T.surfaceHi,
    borderRadius: "10px",
    padding: "12px 14px",
    borderLeft: `3px solid ${T.accent}`,
  },
  moduleIndex: {
    flexShrink: 0,
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    background: T.accent + "18",
    color: T.accent,
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleText: {
    fontSize: "13px",
    color: T.textPri,
    margin: 0,
    lineHeight: 1.5,
  },
  noModules: {
    fontSize: "13px",
    color: T.textMuted,
    fontStyle: "italic",
    margin: 0,
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

export default TeacherCourses;
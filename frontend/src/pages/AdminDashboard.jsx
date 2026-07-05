import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import ApproveTeachers from "./ApproveTeachers";
import ApproveCourses from "./ApproveCourses";
import ApproveQuizzes from "../components/ApproveQuizzes";

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
  warning:   "#facc15",
  danger:    "#f87171",
  textPri:   "#f3f4f6",
  textSec:   "#9099b0",
  textMuted: "#5c6178",
  radius:    "14px",
  font:      "'Inter', 'Segoe UI', sans-serif",
};

const SECTION_META = {
  default: {
    title: "Welcome, Admin",
    sub: "Overview of pending approvals across the platform",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  teachers: {
    title: "Teacher approvals",
    sub: "Review and approve teacher accounts awaiting access",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  courses: {
    title: "Course approvals",
    sub: "Review course submissions before they go live",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  quizzes: {
    title: "Quiz approvals",
    sub: "Review quiz submissions before they go live",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const query = new URLSearchParams(location.search);
  const section = query.get("section");
  const meta = SECTION_META[section] || SECTION_META.default;
  const adminName = localStorage.getItem("username") || "Admin";

  const renderSection = () => {
    switch (section) {
      case "teachers":
        return <ApproveTeachers />;
      case "courses":
        return <ApproveCourses />;
      case "quizzes":
        return <ApproveQuizzes />;
      default:
        return (
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeIcon} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
            </div>
            <h3 style={styles.welcomeTitle}>You're signed in as an administrator</h3>
            <p style={styles.welcomeText}>
              Use the sections on the left to review pending teachers, courses,
              and quizzes before they're published to the platform.
            </p>
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        .admin-nav-btn:hover { background: ${T.surfaceHi}; color: ${T.textPri}; }
        .admin-logout-btn:hover { background: ${T.danger}14; border-color: ${T.danger}55; }
      `}</style>

      <div style={styles.page}>
        <AdminSidebar />

        <div style={styles.body}>
          <header style={styles.topBar}>
            <div style={styles.topLeft}>
              <span style={styles.securePill}>
                <span style={styles.secureDot} aria-hidden="true" />
                Secure session
              </span>
            </div>
            <div style={styles.topRight}>
              <span style={styles.adminName}>{adminName}</span>
              <div style={styles.avatar} aria-hidden="true">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main style={styles.content}>
            <div style={styles.contentHeader}>
              <div style={styles.contentHeaderIcon} aria-hidden="true">
                {meta.icon}
              </div>
              <div>
                <p style={styles.contentHeaderTitle}>{meta.title}</p>
                <p style={styles.contentHeaderSub}>{meta.sub}</p>
              </div>
            </div>

            <div style={styles.contentBody}>{renderSection()}</div>
          </main>
        </div>
      </div>
    </>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: T.bg,
    fontFamily: T.font,
    color: T.textPri,
  },

  body: {
    paddingLeft: "224px",
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  topBar: {
    height: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    borderBottom: `1px solid ${T.border}`,
    background: T.surface,
  },
  topLeft: { display: "flex", alignItems: "center" },
  securePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "12px",
    fontWeight: 600,
    color: T.success,
    background: `${T.success}14`,
    border: `1px solid ${T.success}30`,
    padding: "5px 12px",
    borderRadius: "20px",
  },
  secureDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: T.success,
    boxShadow: `0 0 5px ${T.success}`,
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  adminName: {
    fontSize: "13px",
    color: T.textSec,
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    background: `${T.accentDim}30`,
    border: `1px solid ${T.accentDim}50`,
    color: T.accent,
    fontSize: "12.5px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    margin: "24px 28px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    overflow: "hidden",
  },
  contentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 26px",
    borderBottom: `1px solid ${T.border}`,
  },
  contentHeaderIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: `${T.accentDim}20`,
    border: `1px solid ${T.accentDim}40`,
    color: T.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  contentHeaderTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: T.textPri,
    margin: 0,
  },
  contentHeaderSub: {
    fontSize: "12px",
    color: T.textMuted,
    margin: "2px 0 0",
  },
  contentBody: {
    padding: "26px",
  },

  welcomeCard: {
    textAlign: "center",
    padding: "50px 20px",
  },
  welcomeIcon: {
    width: "46px",
    height: "46px",
    borderRadius: "12px",
    background: `${T.accentDim}20`,
    border: `1px solid ${T.accentDim}40`,
    color: T.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  welcomeTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: T.textPri,
    margin: "0 0 8px",
  },
  welcomeText: {
    fontSize: "13px",
    color: T.textMuted,
    maxWidth: "420px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
};

export default AdminDashboard;
import React, { useState } from "react";
import UploadCourse from "../components/UploadCourse";
import UploadQuiz from "../components/UploadQuiz";
import TeacherCourses from "../components/TeacherCourses";
import TeacherQuizzes from "../components/TeacherQuizzes";

/* ─────────────────────────────────────────
   Design tokens — Soft White (matches all pages)
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
   Tab config — single source of truth
───────────────────────────────────────── */
const TABS = [
  {
    id:    "uploadCourse",
    label: "Upload course",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4m0 0L8 8m4-4 4 4"/>
        <path d="M4 20h16"/>
      </svg>
    ),
  },
  {
    id:    "myCourses",
    label: "My courses",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
      </svg>
    ),
  },
  {
    id:    "uploadQuiz",
    label: "Upload quiz",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    id:    "myQuizzes",
    label: "My quizzes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/>
      </svg>
    ),
  },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: T.bg,
    fontFamily: T.font,
    color: T.textPri,
  },

  /* ── top bar — fixed ── */
  topBar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: "60px",
    borderBottom: `1px solid ${T.border}`,
    background: T.surface,
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  topBarIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: T.accent + "14",
    border: `1px solid ${T.accent}30`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: T.accent,
  },
  topBarTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: T.textPri,
    margin: 0,
  },
  topBarSub: {
    fontSize: "12px",
    color: T.textSec,
    margin: 0,
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  rolePill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 12px",
    borderRadius: "20px",
    background: T.warning + "14",
    border: `1px solid ${T.warning}30`,
    fontSize: "12px",
    fontWeight: 600,
    color: T.warning,
  },
  roleDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: T.warning,
    boxShadow: `0 0 4px ${T.warning}`,
  },
  userName: {
    fontSize: "13px",
    color: T.textSec,
  },

  /* ── body — offset for fixed topbar ── */
  body: {
    paddingTop: "60px",   // topbar height
    paddingLeft: "220px", // sidebar width
    minHeight: "100vh",
    boxSizing: "border-box",
  },

  /* ── left sidebar — fixed ── */
  sidebar: {
    position: "fixed",
    top: "60px",          // below topbar
    left: 0,
    bottom: 0,
    width: "220px",
    background: T.surface,
    borderRight: `1px solid ${T.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "20px 12px",
    overflowY: "auto",
    zIndex: 90,
  },
  sidebarLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: T.textMuted,
    padding: "0 4px",
    marginBottom: "8px",
  },
  tabBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: T.radius,
    border: `1px solid ${active ? T.borderHi + "50" : "transparent"}`,
    background: active ? T.accent + "10" : "transparent",
    color: active ? T.accent : T.textSec,
    fontFamily: T.font,
    fontSize: "13px",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    width: "100%",
  }),
  tabIcon: (active) => ({
    color: active ? T.accent : T.textMuted,
    flexShrink: 0,
    display: "flex",
  }),

  /* ── main content panel ── */
  content: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    margin: "24px 28px",
    minHeight: "calc(100vh - 60px - 48px)", // viewport - topbar - vertical margins
  },
  contentHeader: {
    padding: "20px 28px 16px",
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  contentHeaderIcon: (color) => ({
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: color + "14",
    border: `1px solid ${color}25`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color,
    flexShrink: 0,
  }),
  contentHeaderTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: T.textPri,
    margin: 0,
  },
  contentHeaderSub: {
    fontSize: "12px",
    color: T.textSec,
    margin: "1px 0 0",
  },
  contentBody: {
    flex: 1,
    padding: "24px 28px",
    overflowY: "auto",
  },
};

/* ── content header config per tab ── */
const TAB_META = {
  uploadCourse: {
    title: "Upload a new course",
    sub:   "Add modules and content for students",
    color: T.accent,
  },
  myCourses: {
    title: "My courses",
    sub:   "Manage and review your published courses",
    color: T.success,
  },
  uploadQuiz: {
    title: "Upload a new quiz",
    sub:   "Create questions for your courses",
    color: T.warning,
  },
  myQuizzes: {
    title: "My quizzes",
    sub:   "Review and manage your quizzes",
    color: T.danger,
  },
};

/* ════════════════════════════════════════
   TEACHER DASHBOARD
════════════════════════════════════════ */
const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("uploadCourse");

  const meta     = TAB_META[activeTab];
  const userName = localStorage.getItem("username") || "Teacher";
  const activeTabConfig = TABS.find((t) => t.id === activeTab);

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        button:hover { opacity: 0.88; }
      `}</style>

      <div style={styles.page}>

        {/* ── Top bar ── */}
        <header style={styles.topBar}>
          <div style={styles.topLeft}>
            <div style={styles.topBarIcon} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
              </svg>
            </div>
            <div>
              <p style={styles.topBarTitle}>Teacher Dashboard</p>
              <p style={styles.topBarSub}>Accessible Learning Platform</p>
            </div>
          </div>

          <div style={styles.topRight}>
            <div style={styles.rolePill} aria-label="Role: Teacher">
              <div style={styles.roleDot} aria-hidden="true" />
              Teacher
            </div>
            <span style={styles.userName}>{userName}</span>
          </div>
        </header>

        {/* ── Fixed sidebar nav ── */}
        <nav style={styles.sidebar} aria-label="Dashboard sections">
          <p style={styles.sidebarLabel} aria-hidden="true">Sections</p>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              style={styles.tabBtn(activeTab === tab.id)}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              aria-label={tab.label}
            >
              <span style={styles.tabIcon(activeTab === tab.id)}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* ── Scrollable body — offset from fixed sidebar + topbar ── */}
        <div style={styles.body}>

          {/* ── Content panel ── */}
          <main style={styles.content} aria-label={meta.title}>

            {/* Panel header */}
            <div style={styles.contentHeader}>
              <div style={styles.contentHeaderIcon(meta.color)} aria-hidden="true">
                {activeTabConfig?.icon}
              </div>
              <div>
                <p style={styles.contentHeaderTitle}>{meta.title}</p>
                <p style={styles.contentHeaderSub}>{meta.sub}</p>
              </div>
            </div>

            {/* Panel body — child components render here unchanged */}
            <div style={styles.contentBody}>
              {activeTab === "uploadCourse" && <UploadCourse />}
              {activeTab === "myCourses"    && <TeacherCourses />}
              {activeTab === "uploadQuiz"   && <UploadQuiz />}
              {activeTab === "myQuizzes"    && <TeacherQuizzes />}
            </div>

          </main>
        </div>
      </div>
    </>
  );
};

export default TeacherDashboard;
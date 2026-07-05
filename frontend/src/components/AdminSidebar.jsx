import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  danger:    "#f87171",
  textPri:   "#f3f4f6",
  textSec:   "#9099b0",
  textMuted: "#5c6178",
  font:      "'Inter', 'Segoe UI', sans-serif",
};

const NAV_ITEMS = [
  {
    section: null,
    label: "Overview",
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
  {
    section: "teachers",
    label: "Teachers",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    section: "courses",
    label: "Courses",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    section: "quizzes",
    label: "Quizzes",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const activeSection = query.get("section");

  const goTo = (section) => {
    navigate(section ? `/admin-dashboard?section=${section}` : "/admin-dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav style={styles.sidebar} aria-label="Admin sections">
      <div style={styles.brand}>
        <div style={styles.brandIcon} aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 018 0v3" />
          </svg>
        </div>
        <div>
          <p style={styles.brandTitle}>Admin Portal</p>
          <p style={styles.brandSub}>Restricted access</p>
        </div>
      </div>

      <p style={styles.navLabel}>Sections</p>

      <div style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.section;
          return (
            <button
              key={item.label}
              style={active ? styles.navBtnActive : styles.navBtn}
              className="admin-nav-btn"
              onClick={() => goTo(item.section)}
              aria-current={active ? "page" : undefined}
            >
              <span style={{ ...styles.navIcon, color: active ? T.accent : T.textMuted }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={styles.sidebarFooter}>
        <button style={styles.logoutBtn} className="admin-logout-btn" onClick={handleLogout}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Log out
        </button>
      </div>
    </nav>
  );
};

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "224px",
    background: T.surface,
    borderRight: `1px solid ${T.border}`,
    display: "flex",
    flexDirection: "column",
    padding: "20px 14px",
    boxSizing: "border-box",
    fontFamily: T.font,
    zIndex: 90,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 6px",
    marginBottom: "26px",
  },
  brandIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    background: `${T.accentDim}22`,
    border: `1px solid ${T.accentDim}45`,
    color: T.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: "13.5px",
    fontWeight: 700,
    color: T.textPri,
    margin: 0,
  },
  brandSub: {
    fontSize: "11px",
    color: T.textMuted,
    margin: "1px 0 0",
  },

  navLabel: {
    fontSize: "10.5px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: T.textMuted,
    padding: "0 6px",
    margin: "0 0 8px",
  },

  navList: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1px solid transparent",
    background: "transparent",
    color: T.textSec,
    fontFamily: T.font,
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "background 0.15s, color 0.15s",
  },
  navBtnActive: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "9px",
    border: `1px solid ${T.accentDim}40`,
    background: `${T.accentDim}18`,
    color: T.textPri,
    fontFamily: T.font,
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
  },
  navIcon: {
    display: "flex",
    flexShrink: 0,
  },

  sidebarFooter: {
    marginTop: "auto",
    paddingTop: "14px",
    borderTop: `1px solid ${T.border}`,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    width: "100%",
    padding: "10px 12px",
    borderRadius: "9px",
    border: `1px solid ${T.border}`,
    background: "transparent",
    color: T.danger,
    fontFamily: T.font,
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  },
};

export default AdminSidebar;
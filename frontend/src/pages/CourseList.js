import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  speak,
  setupSpacebarListening,
  removeSpacebarListening,
} from "../utils/voiceUtils";

/* ─────────────────────────────────────────
   Design tokens — same as Login & Register
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
    fontFamily: T.font,
    color: T.textPri,
    display: "flex",
    flexDirection: "column",
  },

  /* ── top bar ── */
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 28px",
    borderBottom: `1px solid ${T.border}`,
    background: T.surface,
  },
  topBarLogo: {
    fontSize: "13px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: T.accent,
    fontWeight: 600,
  },
  topBarUser: {
    fontSize: "13px",
    color: T.textSec,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  userDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: T.success,
    boxShadow: `0 0 6px ${T.success}`,
  },

  /* ── body ── */
  body: {
    display: "flex",
    flex: 1,
    gap: "0",
  },

  /* ── left panel — current course hero ── */
  hero: {
    flex: "0 0 340px",
    padding: "32px 28px",
    borderRight: `1px solid ${T.border}`,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: T.textMuted,
  },
  courseCard: {
    background: T.surfaceHi,
    border: `1px solid ${T.borderHi}`,
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  courseIndex: {
    fontSize: "12px",
    color: T.textSec,
    fontWeight: 500,
  },
  courseTitle: {
    fontSize: "22px",
    fontWeight: 700,
    color: T.textPri,
    lineHeight: 1.3,
    margin: 0,
  },
  courseMeta: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  metaPill: (color) => ({
    fontSize: "12px",
    fontWeight: 600,
    color: color,
    background: color + "18",
    border: `1px solid ${color}30`,
    borderRadius: "20px",
    padding: "3px 10px",
  }),
  courseDesc: {
    fontSize: "13px",
    color: T.textSec,
    lineHeight: 1.6,
    margin: 0,
  },

  /* ── nav hint ── */
  navHint: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: T.textSec,
  },
  navArrows: {
    display: "flex",
    gap: "6px",
  },
  arrowBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    color: T.textSec,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0,
  },

  /* ── mode badge (course vs quiz mode) ── */
  modeBadge: (isQuiz) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: T.radius,
    background: isQuiz ? T.warning + "14" : T.accent + "14",
    border: `1px solid ${isQuiz ? T.warning + "40" : T.accent + "40"}`,
    fontSize: "13px",
    fontWeight: 600,
    color: isQuiz ? T.warning : T.accent,
  }),
  modeDot: (isQuiz) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: isQuiz ? T.warning : T.accent,
    boxShadow: `0 0 5px ${isQuiz ? T.warning : T.accent}`,
  }),

  /* ── voice hint ── */
  voiceBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "#f8f9fc",
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    fontSize: "12px",
    color: T.textSec,
    marginTop: "auto",
  },
  micIcon: {
    width: "14px",
    height: "14px",
    fill: T.accent,
    flexShrink: 0,
  },

  /* ── right panel — course list ── */
  listPanel: {
    flex: 1,
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    overflowY: "auto",
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listTitle: {
    fontSize: "15px",
    fontWeight: 700,
    color: T.textPri,
    margin: 0,
  },
  listCount: {
    fontSize: "12px",
    color: T.textSec,
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "20px",
    padding: "2px 10px",
  },

  /* ── individual course row ── */
  courseRow: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: T.radius,
    background: active ? T.surfaceHi : "transparent",
    border: `1px solid ${active ? T.borderHi : T.border}`,
    cursor: "default",
    transition: "border-color 0.2s, background 0.2s",
  }),
  rowNum: (active) => ({
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: active ? T.accent : T.surface,
    color: active ? "#ffffff" : T.textMuted,
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: `1px solid ${active ? T.accent : T.border}`,
  }),
  rowTitle: (active) => ({
    fontSize: "14px",
    fontWeight: active ? 600 : 400,
    color: active ? T.textPri : T.textSec,
    flex: 1,
  }),
  rowMeta: {
    fontSize: "11px",
    color: T.textMuted,
    flexShrink: 0,
  },

  /* ── quiz sub-mode panel ── */
  quizPanel: {
    flex: 1,
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  quizCard: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    borderRadius: T.radius,
    background: active ? T.warning + "10" : "transparent",
    border: `1px solid ${active ? T.warning + "60" : T.border}`,
  }),
  quizNum: (active) => ({
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: active ? T.warning : T.surface,
    color: active ? "#f8f9fc" : T.textMuted,
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  quizTitle: (active) => ({
    fontSize: "14px",
    fontWeight: active ? 600 : 400,
    color: active ? T.textPri : T.textSec,
  }),

  /* ── empty / loading state ── */
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: T.textSec,
    padding: "40px",
    textAlign: "center",
  },
  emptyIcon: {
    width: "40px",
    height: "40px",
    opacity: 0.3,
  },
  loadingDots: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: (delay) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: T.accent,
    animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
  }),
};

/* ════════════════════════════════════════
   COURSELIST COMPONENT
════════════════════════════════════════ */
const CourseList = () => {
  const [courses, setCourses]           = useState([]);
  const [quizzes, setQuizzes]           = useState([]);
  const [index, setIndex]               = useState(0);
  const [quizMode, setQuizMode]         = useState(null);
  const [activeQuizList, setActiveQuizList] = useState([]);
  const [quizIndex, setQuizIndex]       = useState(0);
  const [loadingData, setLoadingData]   = useState(true);

  const indexRef      = useRef(0);
  const quizModeRef   = useRef(null);
  const activeQuizRef = useRef([]);
  const coursesRef    = useRef([]);
  const quizzesRef    = useRef([]);
  const quizIndexRef  = useRef(0);

  const navigate = useNavigate();

  useEffect(() => { indexRef.current      = index;          }, [index]);
  useEffect(() => { quizModeRef.current   = quizMode;       }, [quizMode]);
  useEffect(() => { activeQuizRef.current = activeQuizList; }, [activeQuizList]);
  useEffect(() => { coursesRef.current    = courses;        }, [courses]);
  useEffect(() => { quizzesRef.current    = quizzes;        }, [quizzes]);
  useEffect(() => { quizIndexRef.current  = quizIndex;      }, [quizIndex]);

  /* ── normalizer ── */
  const normalize = (cmd) => {
    const c = cmd.toLowerCase().trim();
    if (c.includes("next"))                                        return "next";
    if (c.includes("previous") || c.includes("prev") || c.includes("back")) return "previous";
    if (c.includes("open") || c.includes("start"))                return "open";
    if (c.includes("detail"))                                      return "details";
    if (c.includes("progress"))                                    return "progress";
    if (c.includes("list") || c.includes("all"))                   return "list";
    if (c.includes("quiz"))                                        return "quiz";
    if (c.includes("repeat") || c.includes("again"))              return "repeat";
    if (c.includes("help"))                                        return "help";
    const spoken = ["one","two","three","four","five","six","seven","eight","nine","ten"];
    for (let i = 0; i < spoken.length; i++) {
      if (c.includes(spoken[i]) || c.includes(String(i + 1))) return `pick:${i}`;
    }
    return "unknown";
  };

  /* ── speak helpers ── */
  const speakCurrentCourse = (courseList, idx) => {
    const c = courseList[idx];
    speak(
      `Course ${idx + 1} of ${courseList.length}: ${c.title}. ` +
      `Say open to enter, details for description, ` +
      `quiz to see quizzes, next or previous to browse.`
    );
  };

  const speakWelcome = (courseList, quizList) => {
    const userName  = localStorage.getItem("username") || "Student";
    const courseNames = courseList.map((c, i) => `${i + 1}. ${c.title}`).join(". ");
    const quizNames   = quizList.map((q, i)  => `${i + 1}. ${q.title}`).join(". ");
    speak(
      `Welcome ${userName}. ` +
      `You have ${courseList.length} courses available: ${courseNames}. ` +
      `You also have ${quizList.length} quizzes available: ${quizNames}. ` +
      `Say next or previous to browse courses. ` +
      `Say open to enter a course. ` +
      `Say quiz to browse quizzes. ` +
      `Say repeat to hear the current course again. ` +
      `Say help at any time to hear all commands.`
    );
  };

  const speakHelp = () => {
    speak(
      `Available commands: ` +
      `Say next or previous to browse courses. ` +
      `Say open to enter the selected course. ` +
      `Say details to hear the course description. ` +
      `Say quiz to browse all available quizzes. ` +
      `Say list to hear all course names. ` +
      `Say repeat to hear the current course again. ` +
      `Say help to hear this message again.`
    );
  };

  /* ── fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${localStorage.getItem("token")}`;
        const [courseRes, quizRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API}/api/courses`),
          axios.get(`${process.env.REACT_APP_API}/api/quizzes`),
        ]);
        const approvedCourses = courseRes.data.filter((c) => c.isApproved);
        const approvedQuizzes = quizRes.data.filter((q) => q.isApproved);
        setCourses(approvedCourses);
        setQuizzes(approvedQuizzes);
        setLoadingData(false);
        speakWelcome(approvedCourses, approvedQuizzes);
      } catch {
        setLoadingData(false);
        speak("Error fetching courses. Please check your connection and try again.");
      }
    };
    fetchData();
  }, []);

  /* ── voice handler ── */
  useEffect(() => {
    if (!courses.length) return;

    const handleVoiceCommand = (transcript) => {
      const action        = normalize(transcript);
      const currentIndex  = indexRef.current;
      const allCourses    = coursesRef.current;
      const allQuizzes    = quizzesRef.current;
      const currentCourse = allCourses[currentIndex];
      const inQuizPick    = quizModeRef.current === "picking";

      if (inQuizPick) {
        const list    = activeQuizRef.current;
        const qIdx    = quizIndexRef.current;
        const current = list[qIdx];

        if (action === "next") {
          const n = (qIdx + 1) % list.length;
          setQuizIndex(n); quizIndexRef.current = n;
          speak(`Quiz ${n + 1} of ${list.length}: ${list[n].title}. Say open to start.`);
          return;
        }
        if (action === "previous") {
          const p = (qIdx - 1 + list.length) % list.length;
          setQuizIndex(p); quizIndexRef.current = p;
          speak(`Quiz ${p + 1} of ${list.length}: ${list[p].title}. Say open to start.`);
          return;
        }
        if (action === "open") {
          speak(`Opening quiz: ${current.title}.`);
          setQuizMode(null); quizModeRef.current = null;
          navigate(`/quiz/${current._id}`);
          return;
        }
        if (action === "list") {
          const names = list.map((q, i) => `${i + 1}. ${q.title}`).join(". ");
          speak(`Available quizzes: ${names}.`);
          return;
        }
        if (action === "repeat" || action === "help") {
          speak(
            `Currently on quiz ${qIdx + 1} of ${list.length}: ${current.title}. ` +
            `Say next or previous to browse. Say open to start. Say back to return to courses.`
          );
          return;
        }
        if (action === "back") {
          setQuizMode(null); quizModeRef.current = null;
          speakCurrentCourse(coursesRef.current, indexRef.current);
          return;
        }
        speak("Say next, previous, open, list, or back.");
        return;
      }

      switch (action) {
        case "next": {
          const nextIdx = (currentIndex + 1) % allCourses.length;
          setIndex(nextIdx); indexRef.current = nextIdx;
          speakCurrentCourse(allCourses, nextIdx);
          break;
        }
        case "previous": {
          const prevIdx = (currentIndex - 1 + allCourses.length) % allCourses.length;
          setIndex(prevIdx); indexRef.current = prevIdx;
          speakCurrentCourse(allCourses, prevIdx);
          break;
        }
        case "open":
          speak(`Opening ${currentCourse.title}.`);
          navigate(`/course/${currentCourse._id}`);
          break;
        case "details": {
          const courseQuizzes = allQuizzes.filter(q => q.course?._id === currentCourse._id);
          speak(
            `${currentCourse.title}. ` +
            `${currentCourse.description || "No description available."} ` +
            `This course has ${currentCourse.modules?.length || 0} modules ` +
            `and ${courseQuizzes.length} quizzes. ` +
            `Say open to enter, or quiz to pick a quiz.`
          );
          break;
        }
        case "quiz": {
          if (!allQuizzes.length) {
            speak("No quizzes available right now. Check back later.");
            break;
          }
          setActiveQuizList(allQuizzes); activeQuizRef.current = allQuizzes;
          setQuizMode("picking");        quizModeRef.current   = "picking";
          setQuizIndex(0);               quizIndexRef.current  = 0;
          const first = allQuizzes[0];
          speak(
            `${allQuizzes.length} quizzes available. ` +
            `Currently on quiz 1: ${first.title}. ` +
            `Say next or previous to browse quizzes. ` +
            `Say open to start this quiz. ` +
            `Say list to hear all quiz names. ` +
            `Say back to return to courses.`
          );
          break;
        }
        case "list": {
          const names = allCourses.map((c, i) => `${i + 1}. ${c.title}`).join(". ");
          speak(`${allCourses.length} courses available: ${names}.`);
          break;
        }
        case "repeat":
          speakCurrentCourse(allCourses, currentIndex);
          break;
        case "help":
          speakHelp();
          break;
        case "progress":
          speak(`Progress tracking coming soon for ${currentCourse.title}.`);
          break;
        default:
          speak(`Command not recognized. Say help to hear available commands.`);
      }
    };

    setupSpacebarListening(handleVoiceCommand);
    return () => removeSpacebarListening();
  }, [courses, quizzes, navigate]);

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  const currentCourse  = courses[index];
  const isQuizMode     = quizMode === "picking";
  const currentQuiz    = activeQuizList[quizIndex];
  const userName       = localStorage.getItem("username") || "Student";

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1);   }
        }
      `}</style>

      <div style={styles.page} role="main" aria-label="Course list">

        {/* ── Top bar ── */}
        <header style={styles.topBar}>
          <span style={styles.topBarLogo} aria-hidden="true">
            Accessible Learning
          </span>
          <span style={styles.topBarUser}>
            <span style={styles.userDot} aria-hidden="true" />
            {userName}
          </span>
        </header>

        {/* ── Body ── */}
        <div style={styles.body}>

          {/* ── LEFT — current selection hero ── */}
          <aside style={styles.hero} aria-label="Currently selected">

            <p style={styles.sectionLabel} aria-hidden="true">
              {isQuizMode ? "Selected quiz" : "Selected course"}
            </p>

            {/* Loading state */}
            {loadingData && (
              <div style={styles.loadingDots} aria-label="Loading courses">
                <div style={styles.dot(0)}   aria-hidden="true" />
                <div style={styles.dot(0.2)} aria-hidden="true" />
                <div style={styles.dot(0.4)} aria-hidden="true" />
              </div>
            )}

            {/* Course hero card */}
            {!loadingData && !isQuizMode && currentCourse && (
              <div
                style={styles.courseCard}
                role="region"
                aria-label={`Selected: ${currentCourse.title}`}
              >
                <span style={styles.courseIndex}>
                  {index + 1} of {courses.length}
                </span>
                <h2 style={styles.courseTitle}>{currentCourse.title}</h2>
                <div style={styles.courseMeta}>
                  <span style={styles.metaPill(T.accent)}>
                    {currentCourse.modules?.length || 0} modules
                  </span>
                  <span style={styles.metaPill(T.warning)}>
                    {quizzes.filter(q => q.course?._id === currentCourse._id).length} quizzes
                  </span>
                </div>
                {currentCourse.description && (
                  <p style={styles.courseDesc}>
                    {currentCourse.description.length > 120
                      ? currentCourse.description.slice(0, 120) + "…"
                      : currentCourse.description}
                  </p>
                )}
              </div>
            )}

            {/* Quiz hero card */}
            {!loadingData && isQuizMode && currentQuiz && (
              <div
                style={{ ...styles.courseCard, borderColor: T.warning + "80" }}
                role="region"
                aria-label={`Selected quiz: ${currentQuiz.title}`}
              >
                <span style={styles.courseIndex}>
                  Quiz {quizIndex + 1} of {activeQuizList.length}
                </span>
                <h2 style={styles.courseTitle}>{currentQuiz.title}</h2>
                <div style={styles.courseMeta}>
                  <span style={styles.metaPill(T.warning)}>
                    {currentQuiz.questions?.length || 0} questions
                  </span>
                </div>
              </div>
            )}

            {/* Nav hint */}
            {!loadingData && (
              <div style={styles.navHint} aria-hidden="true">
                <div style={styles.navArrows}>
                  <div style={styles.arrowBtn}>←</div>
                  <div style={styles.arrowBtn}>→</div>
                </div>
                <span>Say next or previous to browse</span>
              </div>
            )}

            {/* Mode badge */}
            {!loadingData && (
              <div
                style={styles.modeBadge(isQuizMode)}
                role="status"
                aria-live="polite"
                aria-label={isQuizMode ? "Quiz browsing mode" : "Course browsing mode"}
              >
                <div style={styles.modeDot(isQuizMode)} aria-hidden="true" />
                {isQuizMode ? "Quiz mode — say back to return" : "Course mode"}
              </div>
            )}

            {/* Voice hint */}
            <div style={styles.voiceBar} aria-hidden="true">
              <svg style={styles.micIcon} viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.243a.75.75 0 0 1 .736.912A7.003 7.003 0 0 1 12.75 17.92V20h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5v-2.08A7.003 7.003 0 0 1 4.9 11.155a.75.75 0 0 1 1.472-.311A5.5 5.5 0 0 0 17.5 11c0-.072-.002-.144-.006-.215a.75.75 0 0 1 .87-.542z"/>
              </svg>
              Hold spacebar to speak a command
            </div>

          </aside>

          {/* ── RIGHT — full list ── */}
          {!isQuizMode ? (

            <section style={styles.listPanel} aria-label="All courses">
              <div style={styles.listHeader}>
                <h2 style={styles.listTitle}>All courses</h2>
                <span style={styles.listCount}>{courses.length} available</span>
              </div>

              {loadingData && (
                <div style={styles.emptyState}>
                  <div style={styles.loadingDots} aria-label="Loading">
                    <div style={styles.dot(0)}   aria-hidden="true" />
                    <div style={styles.dot(0.2)} aria-hidden="true" />
                    <div style={styles.dot(0.4)} aria-hidden="true" />
                  </div>
                  <p style={{ color: T.textSec, margin: 0 }}>Loading courses…</p>
                </div>
              )}

              {!loadingData && courses.length === 0 && (
                <div style={styles.emptyState}>
                  <svg style={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke={T.textSec} strokeWidth="1.5">
                    <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                  </svg>
                  <p style={{ color: T.textSec, margin: 0, fontSize: "14px" }}>
                    No courses available yet
                  </p>
                  <p style={{ color: T.textMuted, margin: 0, fontSize: "12px" }}>
                    Check back once a teacher has published content
                  </p>
                </div>
              )}

              {courses.map((course, i) => (
                <div
                  key={course._id}
                  style={styles.courseRow(i === index)}
                  role="listitem"
                  aria-current={i === index ? "true" : undefined}
                  aria-label={`${i + 1}. ${course.title}${i === index ? " — currently selected" : ""}`}
                >
                  <div style={styles.rowNum(i === index)}>{i + 1}</div>
                  <span style={styles.rowTitle(i === index)}>{course.title}</span>
                  <span style={styles.rowMeta}>
                    {course.modules?.length || 0}m · {quizzes.filter(q => q.course?._id === course._id).length}q
                  </span>
                </div>
              ))}
            </section>

          ) : (

            <section style={styles.quizPanel} aria-label="Quiz browser">
              <div style={styles.listHeader}>
                <h2 style={styles.listTitle}>All quizzes</h2>
                <span style={styles.listCount}>{activeQuizList.length} available</span>
              </div>

              {activeQuizList.map((quiz, i) => (
                <div
                  key={quiz._id}
                  style={styles.quizCard(i === quizIndex)}
                  role="listitem"
                  aria-current={i === quizIndex ? "true" : undefined}
                  aria-label={`${i + 1}. ${quiz.title}${i === quizIndex ? " — currently selected" : ""}`}
                >
                  <div style={styles.quizNum(i === quizIndex)}>{i + 1}</div>
                  <span style={styles.quizTitle(i === quizIndex)}>{quiz.title}</span>
                </div>
              ))}
            </section>

          )}

        </div>
      </div>
    </>
  );
};

export default CourseList;
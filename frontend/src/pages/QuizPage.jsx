import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  speak,
  setupSpacebarListening,
  removeSpacebarListening,
} from "../utils/voiceUtils";

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
    flexShrink: 0,
  },
  topLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: T.textSec,
    background: "transparent",
    border: `1px solid ${T.border}`,
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: T.font,
  },
  topBarLogo: {
    fontSize: "13px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: T.accent,
    fontWeight: 600,
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  scoreBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 12px",
    borderRadius: "20px",
    background: T.accent + "12",
    border: `1px solid ${T.accent}30`,
    fontSize: "12px",
    fontWeight: 600,
    color: T.accent,
  },
  userName: {
    fontSize: "13px",
    color: T.textSec,
  },

  /* ── body ── */
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },

  /* ── left sidebar — question list ── */
  sidebar: {
    width: "220px",
    flexShrink: 0,
    borderRight: `1px solid ${T.border}`,
    background: T.surface,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "20px 16px 12px",
    borderBottom: `1px solid ${T.border}`,
  },
  sidebarLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: T.textMuted,
    margin: 0,
  },
  questionList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
  },
  questionDot: (state) => {
    // const map = {
    //   current:  { bg: T.accent,   border: T.accent,   color: "#ffffff" },
    //   answered: { bg: T.success,  border: T.success,  color: "#ffffff" },
    //   pending:  { bg: T.surface,  border: T.border,   color: T.textMuted },
    // };
    //const s = map[state] || map.pending;
    return {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "8px 10px",
      borderRadius: "8px",
      marginBottom: "3px",
      background: state === "current" ? T.accent + "10" : "transparent",
    };
  },
  dotCircle: (state) => {
    const map = {
      current:  { bg: T.accent,  color: "#ffffff" },
      answered: { bg: T.success, color: "#ffffff" },
      pending:  { bg: T.border,  color: T.textMuted },
    };
    const s = map[state] || map.pending;
    return {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: s.bg,
      color: s.color,
      fontSize: "11px",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    };
  },
  dotLabel: (state) => ({
    fontSize: "12px",
    color: state === "current" ? T.textPri : T.textSec,
    fontWeight: state === "current" ? 600 : 400,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),

  /* ── main content ── */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  reader: {
    flex: 1,
    padding: "32px 40px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  /* ── progress ── */
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  progressBar: {
    flex: 1,
    height: "4px",
    background: T.border,
    borderRadius: "2px",
    overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: T.accent,
    borderRadius: "2px",
    transition: "width 0.4s ease",
  }),
  progressLabel: {
    fontSize: "12px",
    color: T.textMuted,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  progressPct: {
    fontSize: "12px",
    color: T.accent,
    fontWeight: 600,
    minWidth: "32px",
    textAlign: "right",
  },

  /* ── question card ── */
  questionCard: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "16px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "640px",
  },
  questionNum: {
    fontSize: "12px",
    color: T.textMuted,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  questionText: {
    fontSize: "18px",
    fontWeight: 600,
    color: T.textPri,
    lineHeight: 1.5,
    margin: 0,
  },

  /* ── option items ── */
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  optionItem: (letter) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: T.radius,
    background: T.surfaceHi,
    border: `1px solid ${T.border}`,
    fontSize: "14px",
    color: T.textPri,
  }),
  optionLetter: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: T.accentDim,
    color: T.accent,
    fontSize: "12px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  /* ── voice command reference ── */
  cmdBox: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "16px 20px",
    maxWidth: "640px",
  },
  cmdLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: T.textMuted,
    marginBottom: "10px",
  },
  cmdRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  cmdPill: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 10px",
    borderRadius: "8px",
    background: T.surfaceHi,
    border: `1px solid ${T.border}`,
    fontSize: "12px",
    fontWeight: 500,
    color: T.textSec,
  },
  cmdKey: {
    fontSize: "10px",
    fontWeight: 700,
    padding: "1px 5px",
    borderRadius: "3px",
    background: T.border,
    color: T.textMuted,
    fontFamily: "monospace",
  },

  /* ── result screen ── */
  resultCard: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    textAlign: "center",
  },
  resultIcon: (pct) => ({
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: pct >= 80 ? T.success + "18" : pct >= 60 ? T.warning + "18" : T.danger + "18",
    border: `2px solid ${pct >= 80 ? T.success : pct >= 60 ? T.warning : T.danger}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
  }),
  resultScore: {
    fontSize: "42px",
    fontWeight: 700,
    color: T.textPri,
    lineHeight: 1,
  },
  resultScoreSub: {
    fontSize: "14px",
    color: T.textSec,
    marginTop: "4px",
  },
  resultFeedback: (pct) => ({
    fontSize: "15px",
    fontWeight: 600,
    color: pct >= 80 ? T.success : pct >= 60 ? T.warning : T.danger,
    padding: "8px 20px",
    borderRadius: "20px",
    background: (pct >= 80 ? T.success : pct >= 60 ? T.warning : T.danger) + "14",
    border: `1px solid ${(pct >= 80 ? T.success : pct >= 60 ? T.warning : T.danger)}30`,
  }),
  resultBreakdown: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    width: "100%",
  },
  resultStat: (color) => ({
    padding: "12px",
    borderRadius: T.radius,
    background: color + "10",
    border: `1px solid ${color}20`,
    textAlign: "center",
  }),
  resultStatNum: (color) => ({
    fontSize: "22px",
    fontWeight: 700,
    color: color,
  }),
  resultStatLabel: {
    fontSize: "11px",
    color: T.textSec,
    marginTop: "2px",
  },
  backBtn2: {
    padding: "12px 28px",
    background: T.accent,
    color: "#ffffff",
    border: "none",
    borderRadius: T.radius,
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: T.font,
    cursor: "pointer",
    letterSpacing: "0.02em",
  },

  /* ── voice bar footer ── */
  voiceBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 28px",
    borderTop: `1px solid ${T.border}`,
    background: T.surface,
    flexShrink: 0,
  },
  micIcon: {
    width: "16px",
    height: "16px",
    fill: T.accent,
    flexShrink: 0,
  },
  voiceBarText: {
    fontSize: "13px",
    color: T.textSec,
  },

  /* ── loading state ── */
  centered: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    color: T.textSec,
  },
  loadingDots: {
    display: "flex",
    gap: "6px",
  },
  dot: (delay) => ({
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: T.accent,
    animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
  }),
};

/* ════════════════════════════════════════
   QUIZ PAGE COMPONENT
════════════════════════════════════════ */
const QuizPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [quiz,            setQuiz]            = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score,           setScore]           = useState(0);
  const [completed,       setCompleted]       = useState(false);
  const [answeredCount,   setAnsweredCount]   = useState(0);

  const quizRef          = useRef(null);
  const questionIndexRef = useRef(0);
  const scoreRef         = useRef(0);

  useEffect(() => { questionIndexRef.current = currentQuestion; }, [currentQuestion]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  /* ── fetch ── */
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${localStorage.getItem("token")}`;
        const res = await axios.get(`${process.env.REACT_APP_API}/api/quizzes/${id}`);
        setQuiz(res.data);
        quizRef.current = res.data;
        speak(
          `Quiz ${res.data.title} loaded. ` +
          `There are ${res.data.questions.length} questions. ` +
          `Say start quiz to begin.`
        );
      } catch {
        speak("Unable to load quiz. Please go back and try again.");
      }
    };
    fetchQuiz();
  }, [id]);

  /* ── read question — unchanged ── */
  const readQuestion = useCallback((index) => {
    if (!quizRef.current) return;
    const q = quizRef.current.questions[index];
    speak(
      `Question ${index + 1}. ` +
      `${q.question}. ` +
      `Option A: ${q.options[0]}. ` +
      `Option B: ${q.options[1]}. ` +
      `Option C: ${q.options[2]}. ` +
      `Option D: ${q.options[3]}. ` +
      `Say option A, option B, option C, or option D.`
    );
  }, []);

  /* ── finish quiz — unchanged ── */
  const finishQuiz = useCallback(() => {
    setCompleted(true);
    const total      = quizRef.current.questions.length;
    const finalScore = scoreRef.current;
    const percent    = Math.round((finalScore / total) * 100);
    const feedback   = percent >= 80 ? "Excellent performance."
                     : percent >= 60 ? "Good job."
                     : "Keep practicing.";
    speak(
      `Quiz completed. ` +
      `You scored ${finalScore} out of ${total}. ` +
      `${feedback} ` +
      `Say home to return to courses.`
    );
  }, []);

  /* ── next question — unchanged ── */
  const nextQuestion = useCallback(() => {
    const next = questionIndexRef.current + 1;
    if (next >= quizRef.current.questions.length) {
      finishQuiz();
      return;
    }
    questionIndexRef.current = next;
    setCurrentQuestion(next);
    setTimeout(() => readQuestion(next), 1000);
  }, [finishQuiz, readQuestion]);

  /* ── evaluate answer — unchanged ── */
  const evaluateAnswer = useCallback((answerIndex) => {
    const q        = quizRef.current.questions[questionIndexRef.current];
    const selected = q.options[answerIndex];
    setAnsweredCount((p) => p + 1);
    if (selected.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
      const newScore = scoreRef.current + 1;
      scoreRef.current = newScore;
      setScore(newScore);
      speak("Correct answer.");
    } else {
      speak(`Wrong answer. The correct answer is ${q.answer}.`);
    }
    setTimeout(() => nextQuestion(), 2500);
  }, [nextQuestion]);

  /* ── voice commands — unchanged ── */
  useEffect(() => {
    const handleVoice = (transcript) => {
      const command = transcript.trim().toLowerCase();
      if (!quizRef.current) return;

      if (completed) {
        if (command.includes("home"))   { navigate("/courses"); return; }
        if (command.includes("repeat")) { finishQuiz(); return; }
        return;
      }

      if (command.includes("start") || command.includes("begin")) {
        readQuestion(questionIndexRef.current); return;
      }
      if (command.includes("repeat")) {
        readQuestion(questionIndexRef.current); return;
      }
      if (command.includes("option a") || command === "a" || command === "one") {
        evaluateAnswer(0); return;
      }
      if (command.includes("option b") || command === "b" || command === "two") {
        evaluateAnswer(1); return;
      }
      if (command.includes("option c") || command === "c" || command === "three") {
        evaluateAnswer(2); return;
      }
      if (command.includes("option d") || command === "d" || command === "four") {
        evaluateAnswer(3); return;
      }
      speak("Command not recognized. Say option A, option B, option C, or option D.");
    };

    setupSpacebarListening(handleVoice);
    return () => removeSpacebarListening();
  }, [completed, navigate, evaluateAnswer, finishQuiz, readQuestion]);

  /* ── derived values ── */
  const total      = quiz?.questions?.length || 0;
  const progress   = total > 0 ? Math.round(((currentQuestion + 1) / total) * 100) : 0;
  const percent    = total > 0 ? Math.round((score / total) * 100) : 0;
  const userName   = localStorage.getItem("username") || "Student";
  const wrongCount = answeredCount - score;

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1);   }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
      `}</style>

      <div style={styles.page} role="main" aria-label="Quiz page">

        {/* ── Top bar ── */}
        <header style={styles.topBar}>
          <div style={styles.topLeft}>
            <button
              style={styles.backBtn}
              onClick={() => navigate("/courses")}
              aria-label="Back to course list"
            >
              ← Courses
            </button>
            <span style={styles.topBarLogo} aria-hidden="true">
              {quiz?.title || "Loading quiz…"}
            </span>
          </div>

          <div style={styles.topBarRight}>
            {!completed && quiz && (
              <div style={styles.scoreBadge} role="status" aria-label={`Score: ${score}`}>
                Score {score}/{total}
              </div>
            )}
            <span style={styles.userName}>{userName}</span>
          </div>
        </header>

        {/* ── Loading ── */}
        {!quiz && (
          <div style={styles.centered} aria-label="Loading quiz">
            <div style={styles.loadingDots}>
              <div style={styles.dot(0)}   aria-hidden="true" />
              <div style={styles.dot(0.2)} aria-hidden="true" />
              <div style={styles.dot(0.4)} aria-hidden="true" />
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: T.textSec }}>
              Loading quiz…
            </p>
          </div>
        )}

        {/* ── Quiz body ── */}
        {quiz && !completed && (
          <div style={styles.body}>

            {/* ── Sidebar — question tracker ── */}
            <aside style={styles.sidebar} aria-label="Question tracker">
              <div style={styles.sidebarHeader}>
                <p style={styles.sidebarLabel}>{total} questions</p>
              </div>
              <div style={styles.questionList} role="list">
                {quiz.questions.map((q, i) => {
                  const state = i === currentQuestion ? "current"
                              : i < currentQuestion   ? "answered"
                              : "pending";
                  return (
                    <div
                      key={i}
                      style={styles.questionDot(state)}
                      role="listitem"
                      aria-current={i === currentQuestion ? "true" : undefined}
                      aria-label={`Question ${i + 1} — ${state}`}
                    >
                      <div style={styles.dotCircle(state)}>
                        {state === "answered" ? "✓" : i + 1}
                      </div>
                      <span style={styles.dotLabel(state)}>
                        {q.question.length > 30
                          ? q.question.slice(0, 30) + "…"
                          : q.question}
                      </span>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* ── Main ── */}
            <main style={styles.main}>
              <div style={styles.reader}>

                {/* Progress */}
                <div style={styles.progressRow}>
                  <span style={styles.progressLabel}>
                    Question {currentQuestion + 1} of {total}
                  </span>
                  <div style={styles.progressBar} aria-hidden="true">
                    <div style={styles.progressFill(progress)} />
                  </div>
                  <span style={styles.progressPct}>{progress}%</span>
                </div>

                {/* Question card */}
                <div
                  style={styles.questionCard}
                  role="region"
                  aria-label={`Question ${currentQuestion + 1}`}
                  aria-live="polite"
                >
                  <span style={styles.questionNum}>
                    Question {currentQuestion + 1}
                  </span>
                  <h2 style={styles.questionText}>
                    {quiz.questions[currentQuestion].question}
                  </h2>

                  <ul style={styles.optionList} aria-label="Answer options">
                    {quiz.questions[currentQuestion].options.map((option, i) => (
                      <li
                        key={i}
                        style={styles.optionItem(String.fromCharCode(65 + i))}
                        aria-label={`Option ${String.fromCharCode(65 + i)}: ${option}`}
                      >
                        <span style={styles.optionLetter} aria-hidden="true">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Command reference */}
                <div style={styles.cmdBox} aria-hidden="true">
                  <p style={styles.cmdLabel}>Voice commands</p>
                  <div style={styles.cmdRow}>
                    {[
                      ["start quiz", "begin"],
                      ["option A",   "first"],
                      ["option B",   "second"],
                      ["option C",   "third"],
                      ["option D",   "fourth"],
                      ["repeat",     "re-read"],
                    ].map(([cmd, hint]) => (
                      <div key={cmd} style={styles.cmdPill}>
                        <span style={styles.cmdKey}>say</span>
                        {cmd}
                        <span style={{ color: T.textMuted, fontSize: "10px" }}>
                          — {hint}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </main>
          </div>
        )}

        {/* ── Result screen ── */}
        {quiz && completed && (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}>
            <div style={styles.resultCard} role="region" aria-label="Quiz results">

              {/* Icon */}
              <div
                style={styles.resultIcon(percent)}
                aria-hidden="true"
              >
                {percent >= 80 ? "🎉" : percent >= 60 ? "👍" : "📚"}
              </div>

              {/* Score */}
              <div>
                <div style={styles.resultScore} aria-label={`Score: ${score} out of ${total}`}>
                  {score}<span style={{ fontSize: "22px", color: T.textSec }}>/{total}</span>
                </div>
                <div style={styles.resultScoreSub}>
                  {quiz.title}
                </div>
              </div>

              {/* Feedback */}
              <div style={styles.resultFeedback(percent)}>
                {percent >= 80
                  ? "Excellent performance"
                  : percent >= 60
                  ? "Good job"
                  : "Keep practicing"}
                {" "}— {percent}%
              </div>

              {/* Breakdown */}
              <div style={styles.resultBreakdown} aria-hidden="true">
                <div style={styles.resultStat(T.success)}>
                  <div style={styles.resultStatNum(T.success)}>{score}</div>
                  <div style={styles.resultStatLabel}>Correct</div>
                </div>
                <div style={styles.resultStat(T.danger)}>
                  <div style={styles.resultStatNum(T.danger)}>{wrongCount}</div>
                  <div style={styles.resultStatLabel}>Incorrect</div>
                </div>
              </div>

              {/* Back button */}
              <button
                style={styles.backBtn2}
                onClick={() => navigate("/courses")}
                aria-label="Return to course list"
              >
                ← Back to courses
              </button>

              {/* Voice hint */}
              <p style={{ fontSize: "12px", color: T.textMuted, margin: 0 }}>
                Say <strong>home</strong> to return · <strong>repeat</strong> to hear score again
              </p>

            </div>
          </div>
        )}

        {/* ── Bottom voice bar ── */}
        <footer style={styles.voiceBar} aria-hidden="true">
          <svg style={styles.micIcon} viewBox="0 0 24 24">
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.243a.75.75 0 0 1 .736.912A7.003 7.003 0 0 1 12.75 17.92V20h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5v-2.08A7.003 7.003 0 0 1 4.9 11.155a.75.75 0 0 1 1.472-.311A5.5 5.5 0 0 0 17.5 11c0-.072-.002-.144-.006-.215a.75.75 0 0 1 .87-.542z"/>
          </svg>
          <span style={styles.voiceBarText}>
            Hold spacebar · speak command · release
          </span>
          {quiz && !completed && (
            <span style={{ marginLeft: "auto", fontSize: "12px", color: T.textMuted }}>
              Say: start quiz · option A/B/C/D · repeat
            </span>
          )}
          {quiz && completed && (
            <span style={{ marginLeft: "auto", fontSize: "12px", color: T.textMuted }}>
              Say: home · repeat
            </span>
          )}
        </footer>

      </div>
    </>
  );
};

export default QuizPage;
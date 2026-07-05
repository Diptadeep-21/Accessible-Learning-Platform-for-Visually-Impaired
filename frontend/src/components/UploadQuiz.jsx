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

const UploadQuiz = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], answer: "" },
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API}/api/courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...questions];
    updated[index].answer = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);

    if (updated.length === 0) {
      updated.push({ question: "", options: ["", "", "", ""], answer: "" });
    }

    setQuestions(updated);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCourse("");
    setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
  };

  const submitQuiz = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      setLoading(true);

      await axios.post(
        `${process.env.REACT_APP_API}/api/quizzes`,
        { title, description, course, questions },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setStatus({
        type: "success",
        message: "Quiz submitted successfully. Waiting for admin approval.",
      });

      resetForm();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Quiz upload failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <style>{`
        .field:focus { outline: none; border-color: ${T.accent} !important; box-shadow: 0 0 0 3px ${T.accent}18; }
        .btn-secondary:hover { background: ${T.accent}10; }
        .btn-remove:hover { background: ${T.danger}12; border-color: ${T.danger}55; }
        .btn-primary:hover:not(:disabled) { background: #4a42d1; }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
        .option-row:focus-within { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.accent}18; }
      `}</style>

      {status && (
        <div style={status.type === "success" ? styles.bannerSuccess : styles.bannerError}>
          <span style={styles.bannerDot(status.type === "success" ? T.success : T.danger)} />
          {status.message}
        </div>
      )}

      <form onSubmit={submitQuiz}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Quiz title</label>
          <input
            className="field"
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 3 Checkpoint"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            className="field"
            style={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this quiz cover?"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Course</label>
          <select
            className="field"
            style={{ ...styles.input, cursor: "pointer" }}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          >
            <option value="">Select course</option>
            {courses.map((item) => (
              <option key={item._id} value={item._id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.sectionHeader}>
          <h3 style={styles.subHeading}>Questions</h3>
          <span style={styles.countPill}>{questions.length}</span>
        </div>

        {questions.map((q, index) => (
          <div key={index} style={styles.questionCard}>
            <div style={styles.questionCardHeader}>
              <span style={styles.qBadge}>Q{index + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  style={styles.removeButton}
                  onClick={() => removeQuestion(index)}
                >
                  Remove
                </button>
              )}
            </div>

            <input
              className="field"
              style={styles.input}
              placeholder="Enter question"
              value={q.question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
            />

            <div style={styles.optionsGrid}>
              {q.options.map((option, optionIndex) => {
                const isAnswer = option !== "" && option === q.answer;
                return (
                  <div
                    key={optionIndex}
                    className="option-row"
                    style={isAnswer ? styles.optionRowActive : styles.optionRow}
                  >
                    <span style={styles.optionLetter}>
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <input
                      style={styles.optionInput}
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, optionIndex, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>Correct answer</label>
              <input
                className="field"
                style={styles.input}
                placeholder="Must match one of the options above"
                value={q.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn-secondary"
          style={styles.secondaryButton}
          onClick={addQuestion}
        >
          + Add question
        </button>

        <button
          type="submit"
          className="btn-primary"
          style={styles.primaryButton}
          disabled={loading}
        >
          {loading ? "Uploading…" : "Upload quiz"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "820px",
    fontFamily: T.font,
  },

  bannerSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: T.success + "10",
    border: `1px solid ${T.success}30`,
    color: T.success,
    padding: "12px 16px",
    borderRadius: T.radius,
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "20px",
  },
  bannerError: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: T.danger + "10",
    border: `1px solid ${T.danger}30`,
    color: T.danger,
    padding: "12px 16px",
    borderRadius: T.radius,
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "20px",
  },
  bannerDot: (color) => ({
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "28px",
    marginBottom: "16px",
  },
  subHeading: {
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
    background: T.accent + "14",
    border: `1px solid ${T.accent}25`,
    borderRadius: "10px",
    padding: "1px 8px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
  },

  label: {
    marginBottom: "7px",
    fontWeight: 600,
    fontSize: "13px",
    color: T.textSec,
  },
  labelSmall: {
    marginBottom: "7px",
    marginTop: "4px",
    fontWeight: 600,
    fontSize: "12px",
    color: T.textMuted,
  },

  input: {
    padding: "11px 13px",
    borderRadius: "9px",
    border: `1px solid ${T.border}`,
    fontSize: "13.5px",
    fontFamily: T.font,
    color: T.textPri,
    background: T.surface,
    marginBottom: "0px",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  textarea: {
    padding: "11px 13px",
    borderRadius: "9px",
    border: `1px solid ${T.border}`,
    minHeight: "76px",
    resize: "vertical",
    fontSize: "13.5px",
    fontFamily: T.font,
    color: T.textPri,
    background: T.surface,
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  questionCard: {
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "20px",
    marginBottom: "18px",
    background: T.surfaceHi,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  questionCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qBadge: {
    fontSize: "12px",
    fontWeight: 700,
    color: T.accent,
    background: T.accent + "14",
    border: `1px solid ${T.accent}25`,
    borderRadius: "8px",
    padding: "3px 10px",
  },

  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "9px",
    padding: "0 4px 0 10px",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  optionRowActive: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: T.success + "0a",
    border: `1px solid ${T.success}45`,
    borderRadius: "9px",
    padding: "0 4px 0 10px",
  },
  optionLetter: {
    fontSize: "11px",
    fontWeight: 700,
    color: T.textMuted,
    flexShrink: 0,
  },
  optionInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "10px 6px",
    fontSize: "13px",
    fontFamily: T.font,
    color: T.textPri,
    outline: "none",
  },

  primaryButton: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: T.accent,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "22px",
    fontSize: "14px",
    fontFamily: T.font,
    transition: "background 0.15s",
  },

  secondaryButton: {
    padding: "10px 16px",
    border: `1px solid ${T.accent}`,
    borderRadius: "9px",
    background: T.surface,
    color: T.accent,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: T.font,
    transition: "background 0.15s",
  },

  removeButton: {
    background: "transparent",
    color: T.danger,
    border: `1px solid ${T.border}`,
    padding: "6px 12px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: T.font,
    transition: "background 0.15s, border-color 0.15s",
  },
};

export default UploadQuiz;
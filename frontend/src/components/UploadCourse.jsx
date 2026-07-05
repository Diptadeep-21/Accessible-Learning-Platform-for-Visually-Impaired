import React, { useState } from "react";
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

const UploadCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [modules, setModules] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }

  const addModule = () => {
    setModules([...modules, ""]);
  };

  const removeModule = (index) => {
    const updated = modules.filter((_, i) => i !== index);
    setModules(updated.length ? updated : [""]);
  };

  const handleModuleChange = (index, value) => {
    const updated = [...modules];
    updated[index] = value;
    setModules(updated);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setDifficulty("");
    setModules([""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      setLoading(true);

      await axios.post(
        `${process.env.REACT_APP_API}/api/courses`,
        { title, description, category, difficulty, modules },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setStatus({
        type: "success",
        message: "Course submitted successfully. Waiting for admin approval.",
      });

      resetForm();
    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Failed to upload course.",
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
      `}</style>

      {status && (
        <div style={status.type === "success" ? styles.bannerSuccess : styles.bannerError}>
          <span style={styles.bannerDot(status.type === "success" ? T.success : T.danger)} />
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Course title</label>
          <input
            className="field"
            style={styles.input}
            placeholder="e.g. Introduction to Algebra"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            className="field"
            style={styles.textarea}
            placeholder="What will students learn in this course?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <input
              className="field"
              style={styles.input}
              placeholder="Programming, AI..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Difficulty</label>
            <select
              className="field"
              style={{ ...styles.input, cursor: "pointer" }}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">Select difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <h3 style={styles.subHeading}>Modules</h3>
          <span style={styles.countPill}>{modules.length}</span>
        </div>

        {modules.map((module, index) => (
          <div key={index} style={styles.moduleContainer}>
            <div style={styles.moduleTop}>
              <span style={styles.moduleIndex}>{index + 1}</span>
              <textarea
                className="field"
                style={styles.textarea}
                placeholder={`Module ${index + 1} content`}
                value={module}
                onChange={(e) => handleModuleChange(index, e.target.value)}
              />
            </div>

            {modules.length > 1 && (
              <button
                type="button"
                className="btn-remove"
                style={styles.removeButton}
                onClick={() => removeModule(index)}
              >
                Remove module
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className="btn-secondary"
          style={styles.secondaryButton}
          onClick={addModule}
        >
          + Add module
        </button>

        <button
          type="submit"
          className="btn-primary"
          style={styles.primaryButton}
          disabled={loading}
        >
          {loading ? "Uploading…" : "Upload course"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "760px",
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

  subHeading: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: T.textMuted,
    margin: 0,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "28px",
    marginBottom: "16px",
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
    flex: 1,
  },

  row: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },

  label: {
    marginBottom: "7px",
    fontWeight: 600,
    fontSize: "13px",
    color: T.textSec,
  },

  input: {
    padding: "11px 13px",
    borderRadius: "9px",
    border: `1px solid ${T.border}`,
    fontSize: "13.5px",
    fontFamily: T.font,
    color: T.textPri,
    background: T.surface,
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  textarea: {
    flex: 1,
    padding: "11px 13px",
    borderRadius: "9px",
    border: `1px solid ${T.border}`,
    minHeight: "88px",
    resize: "vertical",
    fontSize: "13.5px",
    fontFamily: T.font,
    color: T.textPri,
    background: T.surface,
    transition: "border-color 0.15s, box-shadow 0.15s",
  },

  moduleContainer: {
    marginBottom: "14px",
    background: T.surfaceHi,
    border: `1px solid ${T.border}`,
    borderRadius: "10px",
    padding: "14px",
  },
  moduleTop: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  moduleIndex: {
    flexShrink: 0,
    width: "22px",
    height: "22px",
    borderRadius: "6px",
    background: T.accent + "18",
    color: T.accent,
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "2px",
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
    marginTop: "24px",
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
    marginTop: "4px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: T.font,
    transition: "background 0.15s",
  },

  removeButton: {
    marginTop: "10px",
    background: "transparent",
    color: T.danger,
    border: `1px solid ${T.border}`,
    padding: "7px 12px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: T.font,
    transition: "background 0.15s, border-color 0.15s",
  },
};

export default UploadCourse;
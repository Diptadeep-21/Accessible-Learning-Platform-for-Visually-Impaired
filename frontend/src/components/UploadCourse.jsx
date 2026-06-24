import React, { useState } from "react";
import axios from "axios";

const UploadCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [modules, setModules] = useState([""]);
  const [loading, setLoading] = useState(false);

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

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/courses",
        {
          title,
          description,
          category,
          difficulty,
          modules,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Course submitted successfully! Waiting for admin approval.");

      resetForm();
    } catch (err) {
      alert(
        err.response?.data?.error || "Failed to upload course."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create New Course</h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Course Title</label>

            <input
              style={styles.input}
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>

            <textarea
              style={styles.textarea}
              placeholder="Course description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>

              <input
                style={styles.input}
                placeholder="Programming, AI..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Difficulty</label>

              <select
                style={styles.input}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <h3 style={styles.subHeading}>Modules</h3>

          {modules.map((module, index) => (
            <div key={index} style={styles.moduleContainer}>
              <textarea
                style={styles.textarea}
                placeholder={`Module ${index + 1}`}
                value={module}
                onChange={(e) =>
                  handleModuleChange(index, e.target.value)
                }
              />

              {modules.length > 1 && (
                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={() => removeModule(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={addModule}
          >
            + Add Module
          </button>

          <button
            type="submit"
            style={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Course"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    width: "100%",
    maxWidth: "800px",
    background: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  heading: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#333",
  },

  subHeading: {
    marginTop: "20px",
    marginBottom: "15px",
    color: "#444",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "18px",
    flex: 1,
  },

  row: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  label: {
    marginBottom: "8px",
    fontWeight: "600",
    color: "#555",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    minHeight: "90px",
    resize: "vertical",
    fontSize: "14px",
  },

  moduleContainer: {
    marginBottom: "15px",
  },

  primaryButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#667eea",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
    fontSize: "15px",
  },

  secondaryButton: {
    padding: "10px 15px",
    border: "1px solid #667eea",
    borderRadius: "10px",
    background: "#fff",
    color: "#667eea",
    cursor: "pointer",
    marginTop: "10px",
  },

  removeButton: {
    marginTop: "8px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default UploadCourse;
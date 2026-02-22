import React, { useState } from "react";
import axios from "axios";

const TeacherDashboard = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([""]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  const addModule = () => {
    setModules([...modules, ""]);
  };

  const handleModuleChange = (index, value) => {
    const updated = [...modules];
    updated[index] = value;
    setModules(updated);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/courses",
        { title, description, modules, quizzes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Course uploaded successfully");
      setTitle("");
      setDescription("");
      setModules([""]);
    } catch {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create New Course</h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>Course Title</label>
          <input
            style={styles.input}
            placeholder="Enter course title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            style={styles.textarea}
            placeholder="Write a short description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <h3 style={styles.subHeading}>Modules</h3>

        {modules.map((mod, i) => (
          <textarea
            key={i}
            style={styles.textarea}
            placeholder={`Module ${i + 1} content`}
            value={mod}
            onChange={(e) => handleModuleChange(i, e.target.value)}
          />
        ))}

        <button style={styles.secondaryButton} onClick={addModule}>
          + Add Module
        </button>

        <button style={styles.primaryButton} onClick={handleSubmit}>
          {loading ? "Uploading..." : "Upload Course"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
  },
  subHeading: {
    marginTop: "10px",
    fontSize: "18px",
    fontWeight: "500",
    color: "#444",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  input: {
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    transition: "0.3s",
  },
  textarea: {
    padding: "12px 15px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    fontSize: "14px",
    minHeight: "80px",
    resize: "vertical",
    outline: "none",
  },
  primaryButton: {
    marginTop: "10px",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#667eea",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },
  secondaryButton: {
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid #667eea",
    background: "transparent",
    color: "#667eea",
    fontWeight: "500",
    cursor: "pointer",
    transition: "0.3s",
  },
};

export default TeacherDashboard;
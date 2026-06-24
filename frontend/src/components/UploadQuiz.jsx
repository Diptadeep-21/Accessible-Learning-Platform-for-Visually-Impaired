import React, { useEffect, useState } from "react";
import axios from "axios";

const UploadQuiz = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([
    {
      question: "",
      options: ["", "", "", ""],
      answer: "",
    },
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/courses",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
      {
        question: "",
        options: ["", "", "", ""],
        answer: "",
      },
    ]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);

    if (updated.length === 0) {
      updated.push({
        question: "",
        options: ["", "", "", ""],
        answer: "",
      });
    }

    setQuestions(updated);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCourse("");

    setQuestions([
      {
        question: "",
        options: ["", "", "", ""],
        answer: "",
      },
    ]);
  };

  const submitQuiz = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/quizzes",
        {
          title,
          description,
          course,
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Quiz submitted successfully. Waiting for admin approval.");

      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || "Quiz upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Create Quiz</h2>

        <form onSubmit={submitQuiz}>

          <div style={styles.formGroup}>
            <label style={styles.label}>Quiz Title</label>

            <input
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz title"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>

            <textarea
              style={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Quiz description"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Select Course</label>

            <select
              style={styles.input}
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            >
              <option value="">Select Course</option>

              {courses.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <h3 style={styles.subHeading}>Questions</h3>

          {questions.map((q, index) => (
            <div key={index} style={styles.questionCard}>

              <h4>Question {index + 1}</h4>

              <input
                style={styles.input}
                placeholder="Enter Question"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(index, e.target.value)
                }
              />

              {q.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  style={styles.input}
                  placeholder={`Option ${optionIndex + 1}`}
                  value={option}
                  onChange={(e) =>
                    handleOptionChange(
                      index,
                      optionIndex,
                      e.target.value
                    )
                  }
                />
              ))}

              <input
                style={styles.input}
                placeholder="Correct Answer"
                value={q.answer}
                onChange={(e) =>
                  handleAnswerChange(index, e.target.value)
                }
              />

              {questions.length > 1 && (
                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={() => removeQuestion(index)}
                >
                  Remove Question
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={addQuestion}
          >
            + Add Question
          </button>

          <button
            type="submit"
            style={styles.primaryButton}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Quiz"}
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
    maxWidth: "900px",
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
    marginBottom: "10px",
  },

  textarea: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    minHeight: "80px",
    resize: "vertical",
  },

  questionCard: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    background: "#fafafa",
  },

  primaryButton: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#667eea",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "20px",
    fontSize: "15px",
  },

  secondaryButton: {
    padding: "12px",
    border: "1px solid #667eea",
    borderRadius: "10px",
    background: "#fff",
    color: "#667eea",
    cursor: "pointer",
    marginBottom: "20px",
  },

  removeButton: {
    marginTop: "10px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default UploadQuiz;
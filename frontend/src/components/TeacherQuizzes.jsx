import React, { useEffect, useState } from "react";
import axios from "axios";

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/quizzes",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/quizzes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setQuizzes(quizzes.filter((quiz) => quiz._id !== id));

      alert("Quiz deleted successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>Loading quizzes...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Quizzes</h2>

      {quizzes.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3>No quizzes uploaded yet.</h3>
        </div>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz._id} style={styles.card}>
            <div style={styles.topSection}>
              <div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>

                <p>
                  <strong>Course:</strong>{" "}
                  {quiz.course?.title || "No Course"}
                </p>

                <p>
                  <strong>Total Questions:</strong>{" "}
                  {quiz.questions.length}
                </p>
              </div>

              <div>
                {quiz.isApproved ? (
                  <span style={styles.approved}>Approved</span>
                ) : (
                  <span style={styles.pending}>Pending Approval</span>
                )}
              </div>
            </div>

            <hr />

            <h4>Questions</h4>

            {quiz.questions.map((question, index) => (
              <div key={index} style={styles.questionBox}>
                <p>
                  <strong>Q{index + 1}.</strong> {question.question}
                </p>

                <ul style={styles.list}>
                  {question.options.map((option, i) => (
                    <li key={i}>{option}</li>
                  ))}
                </ul>

                <p>
                  <strong>Answer:</strong> {question.answer}
                </p>
              </div>
            ))}

            <button
              style={styles.deleteButton}
              onClick={() => deleteQuiz(quiz._id)}
            >
              Delete Quiz
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
  },

  heading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
  },

  loading: {
    textAlign: "center",
    marginTop: "100px",
  },

  emptyCard: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },

  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "15px",
    marginBottom: "25px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },

  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  approved: {
    background: "#d4edda",
    color: "#155724",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  pending: {
    background: "#fff3cd",
    color: "#856404",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  questionBox: {
    background: "#f8f9fa",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "10px",
  },

  list: {
    marginLeft: "20px",
    marginTop: "10px",
  },

  deleteButton: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default TeacherQuizzes;
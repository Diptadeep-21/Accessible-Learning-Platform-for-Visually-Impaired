import React, { useEffect, useState } from "react";
import axios from "axios";

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error(err);
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/courses/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCourses(courses.filter((course) => course._id !== id));

      alert("Course deleted successfully");
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>Loading courses...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Courses</h2>

      {courses.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3>No courses uploaded yet.</h3>
        </div>
      ) : (
        courses.map((course) => (
          <div key={course._id} style={styles.card}>
            <div style={styles.header}>
              <div>
                <h3>{course.title}</h3>

                <p>{course.description}</p>

                <p>
                  <strong>Category:</strong>{" "}
                  {course.category || "Not specified"}
                </p>

                <p>
                  <strong>Difficulty:</strong>{" "}
                  {course.difficulty || "Not specified"}
                </p>
              </div>

              <div>
                {course.isApproved ? (
                  <span style={styles.approved}>Approved</span>
                ) : (
                  <span style={styles.pending}>Pending Approval</span>
                )}
              </div>
            </div>

            <hr />

            <h4>Modules</h4>

            {course.modules && course.modules.length > 0 ? (
              course.modules.map((module, index) => (
                <div key={index} style={styles.moduleBox}>
                  <strong>Module {index + 1}</strong>

                  <p>{module}</p>
                </div>
              ))
            ) : (
              <p>No modules available.</p>
            )}

            <button
              style={styles.deleteButton}
              onClick={() => deleteCourse(course._id)}
            >
              Delete Course
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
    marginTop: "100px",
    textAlign: "center",
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

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "15px",
  },

  approved: {
    background: "#d4edda",
    color: "#155724",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "600",
  },

  pending: {
    background: "#fff3cd",
    color: "#856404",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "600",
  },

  moduleBox: {
    background: "#f8f9fa",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "15px",
    borderLeft: "4px solid #667eea",
  },

  deleteButton: {
    marginTop: "20px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#dc3545",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default TeacherCourses;
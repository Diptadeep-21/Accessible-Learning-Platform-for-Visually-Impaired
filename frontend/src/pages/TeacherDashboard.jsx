import React, { useState } from "react";
import UploadCourse from "../components/UploadCourse";
import UploadQuiz from "../components/UploadQuiz";
import TeacherCourses from "../components/TeacherCourses";
import TeacherQuizzes from "../components/TeacherQuizzes";

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("uploadCourse");

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Teacher Dashboard</h1>

        <div style={styles.tabs}>
          <button
            style={
              activeTab === "uploadCourse"
                ? styles.activeButton
                : styles.button
            }
            onClick={() => setActiveTab("uploadCourse")}
          >
            Upload Course
          </button>

          <button
            style={
              activeTab === "myCourses"
                ? styles.activeButton
                : styles.button
            }
            onClick={() => setActiveTab("myCourses")}
          >
            My Courses
          </button>

          <button
            style={
              activeTab === "uploadQuiz"
                ? styles.activeButton
                : styles.button
            }
            onClick={() => setActiveTab("uploadQuiz")}
          >
            Upload Quiz
          </button>

          <button
            style={
              activeTab === "myQuizzes"
                ? styles.activeButton
                : styles.button
            }
            onClick={() => setActiveTab("myQuizzes")}
          >
            My Quizzes
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === "uploadCourse" && <UploadCourse />}
          {activeTab === "myCourses" && <TeacherCourses />}
          {activeTab === "uploadQuiz" && <UploadQuiz />}
          {activeTab === "myQuizzes" && <TeacherQuizzes />}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    padding: "30px",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  title: {
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },

  tabs: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 30,
  },

  button: {
    padding: "12px 20px",
    border: "none",
    background: "#ddd",
    cursor: "pointer",
    borderRadius: 10,
  },

  activeButton: {
    padding: "12px 20px",
    border: "none",
    background: "#667eea",
    color: "#fff",
    cursor: "pointer",
    borderRadius: 10,
  },

  content: {
    background: "#fff",
    padding: 25,
    borderRadius: 15,
    boxShadow: "0 10px 30px rgba(0,0,0,.1)",
  },
};

export default TeacherDashboard;
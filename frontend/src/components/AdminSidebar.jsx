import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const section = query.get("section");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const getButtonStyle = (active) => ({
    ...btnStyle,
    background: active ? "#667eea" : "#374151",
  });

  return (
    <div style={styles.sidebar}>
      <div>
        <h2 style={styles.title}>Admin Panel</h2>

        <button
          style={getButtonStyle(!section)}
          onClick={() => navigate("/admin-dashboard")}
        >
          📊 Dashboard
        </button>

        <button
          style={getButtonStyle(section === "teachers")}
          onClick={() =>
            navigate("/admin-dashboard?section=teachers")
          }
        >
          👨‍🏫 Approve Teachers
        </button>

        <button
          style={getButtonStyle(section === "courses")}
          onClick={() =>
            navigate("/admin-dashboard?section=courses")
          }
        >
          📚 Approve Courses
        </button>

        <button
          style={getButtonStyle(section === "quizzes")}
          onClick={() =>
            navigate("/admin-dashboard?section=quizzes")
          }
        >
          📝 Approve Quizzes
        </button>
      </div>

      <button
        style={styles.logoutButton}
        onClick={logout}
      >
        🚪 Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#1f2937",
    color: "#fff",
    padding: "25px 20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
  },

  title: {
    marginBottom: "30px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "600",
  },

  logoutButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.3s",
  },
};

const btnStyle = {
  width: "100%",
  background: "#374151",
  color: "#fff",
  border: "none",
  padding: "12px 15px",
  marginBottom: "12px",
  borderRadius: "8px",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "15px",
  fontWeight: "500",
  transition: "0.3s",
};

export default AdminSidebar;
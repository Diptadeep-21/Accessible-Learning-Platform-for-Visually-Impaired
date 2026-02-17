import React from "react";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div
      style={{
        width: "220px",
        background: "#1f2937",
        color: "white",
        height: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px"
      }}
    >
      <h3 style={{ marginBottom: "20px" }}>Admin Panel</h3>

      <button
        style={btnStyle}
        onClick={() => navigate("/admin-dashboard")}
      >
        Dashboard
      </button>

      <button
        style={btnStyle}
        onClick={() => navigate("/admin-dashboard?section=teachers")}
      >
        Approve Teachers
      </button>

      <button
        style={btnStyle}
        onClick={() => navigate("/admin-dashboard?section=courses")}
      >
        Approve Courses
      </button>

      <button
        style={{ ...btnStyle, background: "#dc2626", marginTop: "auto" }}
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

const btnStyle = {
  background: "#374151",
  color: "white",
  border: "none",
  padding: "10px",
  cursor: "pointer",
  borderRadius: "5px",
  textAlign: "left"
};

export default AdminSidebar;
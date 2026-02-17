import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import ApproveTeachers from "./ApproveTeachers";
import ApproveCourses from "./ApproveCourses";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const query = new URLSearchParams(location.search);
  const section = query.get("section");

  const renderSection = () => {
    switch (section) {
      case "teachers":
        return <ApproveTeachers />;
      case "courses":
        return <ApproveCourses />;
      default:
        return <h3>Welcome Admin</h3>;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />
      <div style={{ padding: "20px", width: "100%" }}>
        <h2>Admin Dashboard</h2>
        {renderSection()}
      </div>
    </div>
  );
};

export default AdminDashboard;
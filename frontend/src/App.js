import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import VoiceFeedback from "./components/VoiceFeedback";

import axios from "axios";
import {
  speak,
  setupSpacebarListening,
  removeSpacebarListening,
} from "./utils/voiceUtils";

// Base URL
axios.defaults.baseURL = "http://localhost:5000/api";

/* ================= ROLE ROUTE ================= */
const RoleRoute = ({ allowedRole, children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* ================= PROTECTED ROUTE ================= */
const ProtectedRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

/* ================= GLOBAL VOICE HANDLER ================= */
const VoiceHandler = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastCommandRef = useRef("");

  useEffect(() => {
    const role = localStorage.getItem("role");

    const isTeacherDashboard =
      role === "teacher" &&
      location.pathname.startsWith("/teacher-dashboard");

    const isAdminDashboard =
      role === "admin" &&
      location.pathname.startsWith("/admin-dashboard");

    // 🚫 Disable voice on dashboards
    if (isTeacherDashboard || isAdminDashboard) {
      removeSpacebarListening();
      return;
    }

    const handleVoiceCommand = (command) => {
      command = command.trim().toLowerCase();
      lastCommandRef.current = command;

      let spoken = "";

      // Broadcast to child components
      window.dispatchEvent(
        new CustomEvent("voiceCommand", { detail: command })
      );

      if (command.includes("help")) {
        spoken =
          "Available commands: home, login, register, courses, profile, logout, repeat.";
      } else if (command.includes("home")) {
        navigate("/");
        spoken = "Navigating to home.";
      } else if (command.includes("login")) {
        navigate("/login");
        spoken = "Navigating to login.";
      } else if (command.includes("register")) {
        navigate("/register");
        spoken = "Navigating to register.";
      } else if (command.includes("courses")) {
        navigate("/courses");
        spoken = "Navigating to courses.";
      } else if (command.includes("profile")) {
        navigate("/profile");
        spoken = "Navigating to profile.";
      } else if (command.includes("logout")) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setIsLoggedIn(false);
        navigate("/");
        spoken = "Logged out successfully.";
      } else if (command.includes("repeat")) {
        spoken = lastCommandRef.current
          ? `Repeating: ${lastCommandRef.current}`
          : "No previous command.";
      } else {
        spoken = `Command not recognized: ${command}`;
      }

      speak(spoken);
    };

    setupSpacebarListening(handleVoiceCommand);

    return () => {
      removeSpacebarListening();
    };
  }, [navigate, setIsLoggedIn, location.pathname]);

  return null;
};

/* ================= LAYOUT ================= */
const Layout = ({ setIsLoggedIn }) => (
  <div role="main" aria-label="Accessible Learning Platform">
    <VoiceHandler setIsLoggedIn={setIsLoggedIn} />

    <VoiceFeedback />

    <h1 hidden>Accessible Learning Platform for the Blind</h1>
    <Outlet />
  </div>
);

/* ================= APP ================= */
// ================= APP =================
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [speechReady, setSpeechReady] = useState(false);

  // 🔥 ACTIVATION (ONLY AFTER USER INTERACTION)
  useEffect(() => {
    const handleStartKey = (e) => {
      // ✅ Allow ANY key (better for accessibility)
      if (!speechReady) {
        speak(
          "Voice control activated. Hold spacebar and speak commands."
        );

        setSpeechReady(true);
        window.removeEventListener("keydown", handleStartKey);
      }
    };

    window.addEventListener("keydown", handleStartKey);

    return () => {
      window.removeEventListener("keydown", handleStartKey);
    };
  }, [speechReady]);

  /* ---------- ACCESSIBLE LANDING SCREEN ---------- */
  if (!speechReady) {
    return (
      <div
        tabIndex="0"
        autoFocus   // 🔥 ensures screen reader reads immediately
        role="alert"
        aria-live="assertive"
        style={{
          textAlign: "center",
          marginTop: "20vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>Accessible Learning Platform</h1>

        <p>Press ANY KEY to start voice control</p>

        {/* 🔥 Screen reader will read this automatically */}
        <span style={{ position: "absolute", left: "-9999px" }}>
          Welcome to Accessible Learning Platform.
          Press any key to activate voice control.
          After that, hold spacebar and speak commands.
        </span>
      </div>
    );
  }

  /* ---------- MAIN APP ---------- */
  return (
    <Router>
      <Routes>
        <Route element={<Layout setIsLoggedIn={setIsLoggedIn} />}>

          <Route path="/" element={<Home />} />

          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />

          <Route
            path="/register"
            element={<Register setIsLoggedIn={setIsLoggedIn} />}
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CourseList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:id"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/secure-admin-login-portal-8392"
            element={<AdminLogin />}
          />

          <Route
            path="/admin-dashboard"
            element={
              <RoleRoute allowedRole="admin">
                <AdminDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/teacher-dashboard"
            element={
              <RoleRoute allowedRole="teacher">
                <TeacherDashboard />
              </RoleRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
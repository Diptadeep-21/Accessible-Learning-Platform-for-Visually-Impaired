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
import VoiceActivationGate from "./components/VoiceActivationGate";
import QuizPage from "./pages/QuizPage";

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

  // ✅ Use refs so the callback always has fresh values
  // without needing to re-register the spacebar listener
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location.pathname);
  const setIsLoggedInRef = useRef(setIsLoggedIn);
  const lastCommandRef = useRef("");

  // Keep refs in sync on every render — no re-registration needed
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    setIsLoggedInRef.current = setIsLoggedIn;
  }, [setIsLoggedIn]);

  // ✅ Register spacebar listener ONCE — never re-register
  useEffect(() => {
    const handleVoiceCommand = (command) => {
      command = command.trim().toLowerCase();

      const currentPath = locationRef.current;
      const currentRole = localStorage.getItem("role");

      const isTeacherDashboard =
        currentRole === "teacher" && currentPath.startsWith("/teacher-dashboard");
      const isAdminDashboard =
        currentRole === "admin" && currentPath.startsWith("/admin-dashboard");

      if (isTeacherDashboard || isAdminDashboard) return;

      lastCommandRef.current = command;

      // ✅ GLOBAL COMMANDS — handle FIRST, before dispatching to children
      let spoken = "";

      if (command.includes("help")) {
  speak(
    "Available commands are. " +
    "Say start learning to begin learning. " +
    "If you are logged in, it opens your courses. " +
    "Otherwise, it takes you to the login page. " +
    "Say login to go to the login page. " +
    "Say register to create a new account. " +
    "Hold the spacebar while speaking any command, then release it."
  );
  return;
}

      if (command.includes("logout")) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        setIsLoggedInRef.current(false);
        navigateRef.current("/");
        speak("Logged out successfully.");
        return;
      }

      if (command.includes("home")) {
        navigateRef.current("/");
        speak("Navigating to home.");
        return;
      }

      if (command.includes("login")) {
        navigateRef.current("/login");
        speak("Navigating to login.");
        return;
      }

      if (command.includes("register")) {
        navigateRef.current("/register");
        speak("Navigating to register.");
        return;
      }

      if (
        command === "start" ||
        command.includes("start learning")
      ) {
        const token = localStorage.getItem("token");

        if (token) {
          speak("Opening your courses.");
          setTimeout(() => {
            navigateRef.current("/courses");
          }, 300);
        } else {
          speak("Please log in first.");
          setTimeout(() => {
            navigateRef.current("/login");
          }, 300);
        }

        return;
      }

      if (command.includes("courses")) {
        const token = localStorage.getItem("token");

        if (token) {
          speak("Navigating to courses.");
          setTimeout(() => {
            navigateRef.current("/courses");
          }, 300);
        } else {
          speak("Please log in first.");
          setTimeout(() => {
            navigateRef.current("/login");
          }, 300);
        }

        return;
      }

      if (command.includes("profile")) {
        navigateRef.current("/profile");
        speak("Navigating to profile.");
        return;
      }

      if (command.includes("repeat")) {
        speak(
          lastCommandRef.current
            ? `Last command was: ${lastCommandRef.current}`
            : "No previous command."
        );
        return;
      }

      // ✅ Only dispatch to children for page-specific commands
      const voiceEvent = new CustomEvent("voiceCommand", {
        detail: command,
        cancelable: true,
      });
      const notHandledByChild = window.dispatchEvent(voiceEvent);

      if (notHandledByChild) {
        // Child didn't handle it either
        speak(`Command not recognized: ${command}`);
      }
    };

    // ✅ Register ONCE — empty dependency array
    setupSpacebarListening(handleVoiceCommand);

    return () => {
      removeSpacebarListening();
    };
  }, []); // ← empty array — never re-registers

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
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [speechReady, setSpeechReady] = useState(false);

  /* ---------- ACCESSIBLE ACTIVATION GATE ---------- */
  // Browsers require a user gesture before audio can play, so this
  // gate appears on every load/refresh. See VoiceActivationGate for
  // the accessibility details (keyboard + click + touch activation,
  // immediate screen-reader announcement, reduced-motion support).
  if (!speechReady) {
    return <VoiceActivationGate onActivate={() => setSpeechReady(true)} />;
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

          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <QuizPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;
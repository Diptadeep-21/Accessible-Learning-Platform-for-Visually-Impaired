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
        spoken =
          "Available commands are: " +
          "Say home to go to the home page. " +
          "Say login to go to the login page. " +
          "Say register to create an account. " +
          "Say courses to view your courses. " +
          "Say profile to view your profile. " +
          "Say logout to log out. " +
          "To use any command, hold spacebar and speak, then release.";
        speak(spoken);
        return; // ✅ don't dispatch to children
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

      if (command.includes("courses")) {
        navigateRef.current("/courses");
        speak("Navigating to courses.");
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
// ================= APP =================
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [speechReady, setSpeechReady] = useState(false);

  // 🔥 ACTIVATION (ONLY AFTER USER INTERACTION)
  useEffect(() => {
    const handleStartKey = (e) => {
      if (speechReady) return;

      // ✅ Step 1 — Play a beep using Web Audio API
      // This works immediately on user gesture with no prior setup
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);       // high beep
        oscillator.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1); // lower beep

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
      } catch (err) {
        console.warn("Audio beep failed:", err);
      }

      // ✅ Step 2 — Speak full instructions AFTER the beep (small delay)
      setTimeout(() => {
        speak(
          "Welcome to the Accessible Learning Platform. " +
          "Voice control is now active. " +
          "To give a command, hold the spacebar and speak. " +
          "Release the spacebar when done. " +
          "Say help at any time to hear available commands."
        );
      }, 350); // wait for beep to finish

      setSpeechReady(true);
      window.removeEventListener("keydown", handleStartKey);
    };

    window.addEventListener("keydown", handleStartKey);
    return () => window.removeEventListener("keydown", handleStartKey);
  }, [speechReady]);

  /* ---------- ACCESSIBLE LANDING SCREEN ---------- */
  if (!speechReady) {
    return (
      <div
        tabIndex="0"
        autoFocus
        role="alert"
        aria-live="assertive"
        aria-label="Accessible Learning Platform. Press any key to activate voice control."
        style={{
          textAlign: "center",
          marginTop: "20vh",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1>Accessible Learning Platform</h1>
        <p>Press ANY KEY to start voice control</p>

        {/* Visible blinking cue for low-vision users */}
        <p style={{
          fontSize: 14,
          color: "#666",
          animation: "blink 1.5s ease-in-out infinite"
        }}>
          🔊 Voice instructions will begin after you press any key
        </p>

        <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
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
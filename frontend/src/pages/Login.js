import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { speak } from "../utils/voiceUtils";

const Login = ({ setIsLoggedIn }) => {
  const videoRef = useRef();
  const navigate = useNavigate();

  const [role, setRole] = useState("student"); // NEW

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");      // Teacher/Admin
  const [password, setPassword] = useState(""); // Teacher/Admin

  const [uiStep, setUiStep] = useState("welcome");
  const [loading, setLoading] = useState(false);

  const state = useRef({
    step: "welcome",
    username: "",
  });

  const setStep = (step) => {
    state.current.step = step;
    setUiStep(step);
  };

  /*************************************************
   **************** STUDENT LOGIN ******************
   *************************************************/

  useEffect(() => {
    if (role !== "student") return;

    const step = state.current.step;

    if (step === "welcome")
      speak("Welcome. Hold the space bar and say your username.");

    if (step === "confirm")
      speak(`I heard ${state.current.username}. Press 1 to confirm or 2 to retry.`);

    if (step === "camera")
      speak("Username confirmed. Say start camera to turn on your camera.");

    if (step === "ready")
      speak("Camera is active. Press Enter to scan your face.");

    if (step === "scanning")
      speak("Scanning. Please stay still.");
  }, [uiStep, role]);

  useEffect(() => {
    if (role !== "student") return;

    const listener = (e) => {
      const raw = e.detail || "";
      const cmd = raw.trim().toLowerCase();
      const step = state.current.step;

      if (step === "welcome") {
        if (!cmd) return speak("Say your username.");
        state.current.username = cmd;
        setUsername(cmd);
        setStep("confirm");
        return;
      }

      if (step === "camera") {
        if (cmd.includes("start camera")) startCamera();
        else speak("Say start camera to continue.");
      }
    };

    // In Login.jsx — voice listener
    window.addEventListener("voiceCommand", (e) => {
      const cmd = e.detail || "";
      const step = state.current.step;

      if (step === "welcome") {
        if (!cmd) return speak("Say your username.");
        e.preventDefault(); // ← I handled this, stop App.js from also processing it
        state.current.username = cmd;
        setUsername(cmd);
        setStep("confirm");
        return;
      }

      if (step === "camera") {
        if (cmd.includes("start camera")) {
          e.preventDefault(); // ← handled
          startCamera();
        } else {
          e.preventDefault(); // ← still handled (wrong command, but we gave feedback)
          speak("Say start camera to continue.");
        }
      }
    });
    return () => window.removeEventListener("voiceCommand", listener);
  }, [role]);

  useEffect(() => {
    if (role !== "student") return;

    const handler = (e) => {
      const step = state.current.step;

      if (step === "confirm") {
        if (e.key === "1") setStep("camera");
        if (e.key === "2") {
          state.current.username = "";
          setUsername("");
          setStep("welcome");
        }
      }

      if (step === "ready" && e.key === "Enter") {
        setStep("scanning");
        handleStudentLogin();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [role]);

  const startCamera = async () => {
    speak("Starting your camera.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);

      setStep("ready");
    } catch {
      speak("Camera error. Please allow permission.");
      setStep("welcome");
    }
  };

  const handleStudentLogin = async () => {
    setLoading(true);
    const username = state.current.username;

    try {
      // BEFORE: single detectSingleFace call
      // AFTER: up to 8 attempts with 250ms gaps (same as Register.jsx)
      let detection = null;
      for (let i = 0; i < 8; i++) {
        detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection) break;
        await new Promise((r) => setTimeout(r, 250));
      }

      if (!detection) {
        speak("No face detected. Press Enter to try again.");
        setStep("ready");
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      const res = await axios.post("http://localhost:5000/api/auth/face-login", {
        username,
        faceDescriptor: descriptor,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role || "student");
        localStorage.setItem("username", res.data.username);

        setIsLoggedIn(true);
        navigate("/courses");
      }
    } catch {
      speak("Face not recognized. Press Enter to try again.");
      setStep("ready");
    }

    setLoading(false);
  };

  /*************************************************
   **************** TEACHER LOGIN ******************
   *************************************************/

  const handleTeacherLogin = async () => {
    if (!email || !password) {
      alert("Email and password required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      setIsLoggedIn(true);

      // Role based redirect
      if (res.data.role === "admin")
        navigate("/admin-dashboard");
      else if (res.data.role === "teacher")
        navigate("/teacher-dashboard");
      else
        navigate("/courses");

    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /*************************************************
   ********************* UI ***********************
   *************************************************/

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>Login</h1>

      {/* ROLE SELECTOR */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setRole("student")}>Student</button>
        <button onClick={() => setRole("teacher")}>Teacher</button>
      </div>

      {role === "student" && (
        <>
          <video
            ref={videoRef}
            width="560"
            height="420"
            autoPlay
            muted
            style={{ borderRadius: 20, marginTop: 30 }}
          />
          {loading && <p>Scanning face...</p>}
        </>
      )}

      {role === "teacher" && (
        <div style={{ maxWidth: 300, margin: "0 auto" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: 10 }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: 10 }}
          />

          <button onClick={handleTeacherLogin}>
            {loading ? "Logging in..." : "Login as Teacher"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
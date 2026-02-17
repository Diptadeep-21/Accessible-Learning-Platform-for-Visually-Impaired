import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { speak } from "../utils/voiceUtils";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const videoRef = useRef();
  const navigate = useNavigate();

  // NEW: Role selector
  const [role, setRole] = useState("student");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");       // For teacher
  const [password, setPassword] = useState(""); // For teacher

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

  /***********************************
   * LOAD FACE MODELS (STUDENTS ONLY)
   ***********************************/
  useEffect(() => {
    if (role !== "student") return;

    const loadModels = async () => {
      if (window.faceModelsLoaded) return;

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        window.faceModelsLoaded = true;
        console.log("FACE MODELS LOADED");
      } catch (err) {
        console.error("Model Load Error:", err);
        speak("Face recognition models could not be loaded.");
      }
    };

    loadModels();
  }, [role]);

  /***********************************
   * SPEAK ON STEP CHANGE (STUDENT)
   ***********************************/
  useEffect(() => {
    if (role !== "student") return;

    const step = state.current.step;

    switch (step) {
      case "welcome":
        speak("Welcome to face registration. Hold space and say your username.");
        break;
      case "confirm":
        speak(`I heard ${state.current.username}. Press 1 to confirm or 2 to retry.`);
        break;
      case "camera":
        speak("Username confirmed. Say start camera to continue.");
        break;
      case "ready":
        speak("Camera ready. Press Enter to register your face.");
        break;
      case "registering":
        speak("Registering your face. Please hold still.");
        break;
      default:
        break;
    }
  }, [uiStep, role]);

  /***********************************
   * VOICE LISTENER (STUDENT ONLY)
   ***********************************/
  useEffect(() => {
    if (role !== "student") return;

    const listener = (e) => {
      const raw = e.detail || "";
      const cmd = raw.trim().toLowerCase();
      const step = state.current.step;

      if (step === "welcome") {
        if (!cmd) return speak("Please say your username.");
        state.current.username = cmd;
        setUsername(cmd);
        setStep("confirm");
        return;
      }

      if (step === "camera") {
        if (cmd.includes("start camera")) {
          startCamera();
        } else {
          speak("Say start camera to continue.");
        }
      }
    };

    window.addEventListener("voiceCommand", listener);
    return () => window.removeEventListener("voiceCommand", listener);
  }, [role]);

  /***********************************
   * KEYBOARD HANDLER (STUDENT ONLY)
   ***********************************/
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
        setStep("registering");
        handleStudentRegister();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [role]);

  /***********************************
   * START CAMERA (STUDENT)
   ***********************************/
  const startCamera = async () => {
    speak("Starting the camera. Please wait.");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setTimeout(() => {
        setStep("ready");
      }, 500);
    } catch (err) {
      speak("Camera access denied. Please allow permission.");
      setStep("welcome");
    }
  };

  /***********************************
   * STUDENT FACE REGISTRATION
   ***********************************/
  const handleStudentRegister = async () => {
    setLoading(true);

    if (!window.faceModelsLoaded) {
      speak("Models are still loading. Please wait.");
      setLoading(false);
      return;
    }

    let detection = null;

    for (let i = 0; i < 8; i++) {
      detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) break;
      await new Promise((res) => setTimeout(res, 250));
    }

    if (!detection) {
      speak("Face not detected. Press Enter to try again.");
      setLoading(false);
      setStep("ready");
      return;
    }

    const descriptor = Array.from(detection.descriptor);

    try {
      await axios.post("http://localhost:5000/api/auth/student-register", {
        username: state.current.username,
        faceDescriptor: descriptor,
      });

      speak("Registration successful. Redirecting to login page.");
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      speak("Registration failed. Try again.");
      setStep("ready");
    } finally {
      setLoading(false);
    }
  };

  /***********************************
   * TEACHER REGISTRATION
   ***********************************/
  const handleTeacherRegister = async () => {
    if (!username || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/auth/teacher-register", {
        username,
        email,
        password,
      });

      alert("Teacher registered. Await admin approval.");
      navigate("/teacher-login");

    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  /***********************************
   * UI
   ***********************************/
  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Register</h2>

      {/* ROLE SELECTOR */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setRole("student")}>Student</button>
        <button onClick={() => setRole("teacher")}>Teacher</button>
      </div>

      {role === "student" && (
        <>
          <h3>Face Registration</h3>

          {uiStep === "confirm" && (
            <div style={{ background: "#fff3cd", padding: 20, borderRadius: 12 }}>
              <h4>You said: {username}</h4>
              <p>Press 1 to confirm or 2 to retry.</p>
            </div>
          )}

          <video
            ref={videoRef}
            width="500"
            height="380"
            autoPlay
            muted
            style={{ borderRadius: 10, marginTop: 20 }}
          />

          {loading && <p>Registering your face...</p>}
        </>
      )}

      {role === "teacher" && (
        <div style={{ maxWidth: 300, margin: "0 auto" }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: "block", width: "100%", marginBottom: 10 }}
          />

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

          <button onClick={handleTeacherRegister}>
            {loading ? "Registering..." : "Register as Teacher"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
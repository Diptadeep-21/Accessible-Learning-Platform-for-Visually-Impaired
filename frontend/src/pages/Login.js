import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { speak } from "../utils/voiceUtils";

const Login = ({ setIsLoggedIn }) => {
  const videoRef = useRef();
  const navigate = useNavigate();

  // UI state only
  const [username, setUsername] = useState("");
  const [uiStep, setUiStep] = useState("welcome");
  const [loading, setLoading] = useState(false);

  // Synchronous state machine
  const state = useRef({
    step: "welcome",
    username: "",
  });

  const setStep = (step) => {
    state.current.step = step;
    setUiStep(step);
  };

  // ------------------------
  // SPEAK ON STEP CHANGE
  // ------------------------
  useEffect(() => {
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
  }, [uiStep]);

  // ------------------------
  // VOICE COMMAND HANDLING
  // ------------------------
  useEffect(() => {
    const listener = (e) => {
      const raw = e.detail || "";
      const cmd = raw.trim().toLowerCase();
      const step = state.current.step;

      console.log("VOICE:", cmd, "STEP:", step);

      // Username input
      if (step === "welcome") {
        if (!cmd) return speak("Say your username.");
        state.current.username = cmd;
        setUsername(cmd);
        setStep("confirm");
        return;
      }

      // Start camera
      if (step === "camera") {
        if (cmd.includes("start camera")) {
          startCamera();
        } else {
          speak("Say start camera to continue.");
        }
        return;
      }
    };

    window.addEventListener("voiceCommand", listener);
    return () => window.removeEventListener("voiceCommand", listener);
  }, []);

  // ------------------------
  // KEYBOARD CONFIRMATION
  // ------------------------
  useEffect(() => {
    const handler = (e) => {
      const step = state.current.step;

      // Confirm username
      if (step === "confirm") {
        if (e.key === "1") {
          setStep("camera"); // confirmed
          return;
        }
        if (e.key === "2") {
          state.current.username = "";
          setUsername("");
          setStep("welcome");
          return;
        }
      }

      // Scan face
      if (step === "ready" && e.key === "Enter") {
        setStep("scanning");
        handleLogin();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ------------------------
  // START CAMERA
  // ------------------------
  const startCamera = async () => {
    speak("Starting your camera. Please wait.");
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
      speak("Camera error. Please allow permission and retry.");
      setStep("welcome");
    }
  };

  // ------------------------
  // FACE LOGIN
  // ------------------------
  const handleLogin = async () => {
    setLoading(true);
    const username = state.current.username;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

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
        speak(`Welcome ${username}. Login successful.`);
        setIsLoggedIn(true);

        setTimeout(() => navigate("/courses"), 1500);
      }
    } catch {
      speak("Face not recognized. Press Enter to try again.");
      setStep("ready");
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>Accessible Face + Voice Login</h1>

      {state.current.username && uiStep === "confirm" && (
        <div style={{ background: "#fff3cd", padding: 20, borderRadius: 12 }}>
          <p>You said: <strong>{state.current.username}</strong></p>
          <p>Press <strong>1</strong> to confirm or <strong>2</strong> to retry</p>
        </div>
      )}

      <video
        ref={videoRef}
        width="560"
        height="420"
        autoPlay
        muted
        style={{ borderRadius: 20, marginTop: 30 }}
      />

      {loading && <p style={{ fontSize: "1.4em", color: "#ff6b00" }}>Scanning face...</p>}

      <div style={{ marginTop: 20, fontSize: "1.1em" }}>
        {uiStep === "welcome" && "Hold spacebar → Say your username"}
        {uiStep === "confirm" && "Press 1 to confirm, 2 to retry"}
        {uiStep === "camera" && "Say: start camera"}
        {uiStep === "ready" && "Press Enter to login"}
      </div>
    </div>
  );
};

export default Login;

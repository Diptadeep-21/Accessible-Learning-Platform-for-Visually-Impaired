import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { speak } from "../utils/voiceUtils";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const videoRef = useRef();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
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
   * LOAD MODELS ONCE
   ***********************************/
  useEffect(() => {
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
  }, []);

  /******************************
   * SPEAK ON STEP CHANGE
   ******************************/
  useEffect(() => {
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
  }, [uiStep]);

  /*******************************
   * VOICE COMMAND LISTENER
   *******************************/
  useEffect(() => {
    const listener = (e) => {
      const raw = e.detail || "";
      const cmd = raw.trim().toLowerCase();
      const step = state.current.step;

      console.log("VOICE:", cmd, "STEP:", step);

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
        return;
      }
    };

    window.addEventListener("voiceCommand", listener);
    return () => window.removeEventListener("voiceCommand", listener);
  }, []);

  /*******************************
   * KEYBOARD HANDLER
   *******************************/
  useEffect(() => {
    const handler = (e) => {
      const step = state.current.step;

      if (step === "confirm") {
        if (e.key === "1") {
          setStep("camera");
        }
        if (e.key === "2") {
          state.current.username = "";
          setUsername("");
          setStep("welcome");
        }
      }

      if (step === "ready" && e.key === "Enter") {
        console.log("ENTER PRESSED → START REGISTER");
        setStep("registering");
        handleRegister();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /*******************************
   * START CAMERA
   *******************************/
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
      console.error("Camera error:", err);
      speak("Camera access denied. Please allow camera permission.");
      setStep("welcome");
    }
  };

  /*******************************
   * REGISTER FACE (WITH RETRY)
   *******************************/
  const handleRegister = async () => {
    setLoading(true);

    if (!window.faceModelsLoaded) {
      speak("Models are still loading. Please wait and press Enter again.");
      setLoading(false);
      setStep("ready");
      return;
    }

    let detection = null;

    // Retry face detection for 2 seconds
    for (let i = 0; i < 8; i++) {
      detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) break;
      await new Promise((res) => setTimeout(res, 250));
    }

    if (!detection) {
      speak("Face not detected. Ensure your face is visible. Press Enter to try again.");
      setLoading(false);
      setStep("ready");
      return;
    }

    const descriptor = Array.from(detection.descriptor);

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username: state.current.username,
        faceDescriptor: descriptor,
      });

      speak("Registration successful. Redirecting to login page.");

      setLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("REGISTER ERROR:", err);
      speak("Registration failed. Press Enter to try again.");
      setLoading(false);
      setStep("ready");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>Face Registration</h2>

      {uiStep === "confirm" && (
        <div style={{ background: "#fff3cd", padding: 20, borderRadius: 12 }}>
          <h3>You said: {username}</h3>
          <p>Press <strong>1</strong> to confirm or <strong>2</strong> to retry.</p>
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

      <div style={{ marginTop: 20, fontSize: "1.1em" }}>
        {uiStep === "welcome" && "Hold space and say your username"}
        {uiStep === "confirm" && "Press 1 to confirm, 2 to retry"}
        {uiStep === "camera" && "Say: start camera"}
        {uiStep === "ready" && "Press Enter to register your face"}
        {uiStep === "registering" && "Processing face..."}
      </div>
    </div>
  );
};

export default Register;

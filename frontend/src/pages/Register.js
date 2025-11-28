// Register.js
import React, { useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const Register = () => {
  const videoRef = useRef();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const startVideo = async () => {
    await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  };

  const loadModels = async () => {
    const MODEL_URL = '/models'; // you’ll store models in /public/models
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
  };

  const captureFace = async () => {
    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!detections) {
      alert('No face detected. Try again.');
      return;
    }
    return Array.from(detections.descriptor);
  };

  const handleRegister = async () => {
    setLoading(true);
    await loadModels();
    const descriptor = await captureFace();
    if (!descriptor) return;

    await axios.post('http://localhost:5000/api/auth/register', {
      username,
      faceDescriptor: descriptor,
    });

    alert('Registration successful!');
    setLoading(false);
  };

  return (
    <div>
      <h2>Face Registration</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={startVideo}>Start Camera</button>
      <video ref={videoRef} width="320" height="240" autoPlay muted />
      <button onClick={handleRegister} disabled={loading}>Register</button>
    </div>
  );
};

export default Register;

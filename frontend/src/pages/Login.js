// Login.js
import React, { useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsLoggedIn }) => {
  const videoRef = useRef();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const startVideo = async () => {
    await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
  };

  const loadModels = async () => {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
  };

  const handleLogin = async () => {
    setLoading(true);
    await loadModels();

    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      alert('Face not detected. Please try again.');
      setLoading(false);
      return;
    }

    const faceDescriptor = Array.from(detections.descriptor);

    const res = await axios.post('http://localhost:5000/api/auth/face-login', {
      username,
      faceDescriptor,
    });

    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      navigate('/courses');
    } else {
      alert('Face not recognized or invalid user.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Face Login</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={startVideo}>Start Camera</button>
      <video ref={videoRef} width="320" height="240" autoPlay muted />
      <button onClick={handleLogin} disabled={loading}>Login</button>
    </div>
  );
};

export default Login;

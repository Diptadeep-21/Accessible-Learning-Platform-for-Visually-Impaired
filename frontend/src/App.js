import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import { speak, startListening, stopListening } from './utils/voiceUtils';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';
const VoiceHandler = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const lastCommandRef = useRef('');

  React.useEffect(() => {
    const handleVoiceCommand = (command) => {
      lastCommandRef.current = command;
      let spoken = '';

      // Always dispatch the event for page-level listeners
      window.dispatchEvent(new CustomEvent('voiceCommand', { detail: command }));

      if (command.includes('help')) {
        spoken = 'Available commands: home, login, register, courses, profile, logout, repeat, volume up, volume down.';
      } else if (command.includes('home')) {
        navigate('/');
        spoken = 'Navigating to home.';
      } else if (command.includes('login')) {
        navigate('/login');
        spoken = 'Navigating to login.';
      } else if (command.includes('register')) {
        navigate('/register');
        spoken = 'Navigating to register.';
      } else if (command.includes('courses')) {
        navigate('/courses');
        spoken = 'Navigating to courses.';
      } else if (command.includes('profile')) {
        navigate('/profile');
        spoken = 'Navigating to profile.';
      } else if (command.includes('logout')) {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        navigate('/');
        spoken = 'Logged out.';
      } else if (command.includes('repeat')) {
        spoken = lastCommandRef.current
          ? `Repeating: ${lastCommandRef.current}`
          : 'No previous command to repeat.';
      } else if (command.includes('volume up')) {
        spoken = 'Volume increased.';
      } else if (command.includes('volume down')) {
        spoken = 'Volume decreased.';
      } else {
        spoken = `Command not recognized: ${command}`;
      }
      speak(`You said: ${command}. ${spoken}`);
    };

    startListening(handleVoiceCommand);
    return () => stopListening();
  }, [navigate, setIsLoggedIn]);

  return null;
};

const Layout = ({ setIsLoggedIn }) => (
  <div role="main" aria-label="Accessible Learning Platform">
    <VoiceHandler setIsLoggedIn={setIsLoggedIn} />
    <h1 hidden>Accessible Learning Platform for the Blind</h1>
    <Outlet />
  </div>
);

const ProtectedRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [speechReady, setSpeechReady] = useState(false);

  if (!speechReady) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh' }}>
        <button
          onClick={() => setSpeechReady(true)}
          style={{ fontSize: '2rem', padding: '1rem 2rem' }}
        >
          Start Accessible Platform
        </button>
        <p>Click to enable voice and speech features.</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout setIsLoggedIn={setIsLoggedIn} />}>
          {/* Home is always public */}
          <Route path="/" element={<Home />} />
          {/* Public routes */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
          {/* Protected routes */}
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
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
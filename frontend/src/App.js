import React, { useState, useRef } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
  useNavigate
} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import { speak, setupSpacebarListening } from './utils/voiceUtils'; // Updated import
import axios from 'axios';

// Set base URL for API calls
axios.defaults.baseURL = 'http://localhost:5000/api';

const VoiceHandler = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const lastCommandRef = useRef('');

  React.useEffect(() => {
    const handleVoiceCommand = (command) => {
      command = command.trim().toLowerCase();
      lastCommandRef.current = command;
      let spoken = '';

      // Always dispatch for page-level listeners (Login/Register)
      window.dispatchEvent(new CustomEvent('voiceCommand', { detail: command }));

      if (command.includes('help')) {
        spoken = 'Available commands: home, login, register, courses, profile, logout, repeat.';
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
        spoken = 'Logged out successfully.';
      } else if (command.includes('repeat')) {
        spoken = lastCommandRef.current
          ? `Repeating: ${lastCommandRef.current}`
          : 'No previous command to repeat.';
      } else {
        spoken = `Command not recognized: ${command}`;
      }

      speak(`You said: ${command}. ${spoken}`);
    };

    // Setup global "Press & Hold Spacebar" listener
    setupSpacebarListening(handleVoiceCommand);

    // Optional: Welcome message
    speak('Voice control activated. Hold spacebar and speak to navigate.');

    // No cleanup needed — listeners are managed inside voiceUtils.js
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
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [speechReady, setSpeechReady] = useState(false);

  if (!speechReady) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20vh', fontFamily: 'Arial, sans-serif' }}>
        <h1>Welcome to Accessible Learning Platform</h1>
        <p>Hold <kbd style={{ padding: '0.2em 0.4em', background: '#eee', borderRadius: '4px' }}>Spacebar</kbd> and speak to control the app</p>
        <button
          onClick={() => setSpeechReady(true)}
          style={{
            fontSize: '1.8rem',
            padding: '1rem 2rem',
            margin: '2rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Start Voice Control
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<Layout setIsLoggedIn={setIsLoggedIn} />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
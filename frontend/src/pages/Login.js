import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { speak } from '../utils/voiceUtils';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(0); // 0: username, 1: password, 2: confirm
  const lastPrompt = useRef('');
  const stepRef = useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const prompt = 'Welcome to login. Please say your username.';
    speak(prompt);
    lastPrompt.current = prompt;

    const handleCommand = (e) => {
      const command = e.detail.trim();
      if (command.includes('reset')) {
        setUsername('');
        setPassword('');
        setStep(0);
        const prompt = 'Resetting login. Please say your username.';
        speak(prompt);
        lastPrompt.current = prompt;
        return;
      }
      if (command.includes('repeat')) {
        speak(lastPrompt.current);
        return;
      }

      if (stepRef.current === 0) {
        setUsername(command);
        setStep(1);
        const prompt = `Username set to ${command}. Please say your password.`;
        speak(prompt);
        lastPrompt.current = prompt;
      } else if (stepRef.current === 1) {
        setPassword(command);
        setStep(2);
        const prompt = 'Password set. Say "login" to submit or "reset" to start over.';
        speak(prompt);
        lastPrompt.current = prompt;
      } else if (stepRef.current === 2 && command.includes('login')) {
        handleLogin();
      } else if (stepRef.current === 2) {
        const prompt = 'Say "login" to submit or "reset" to start over.';
        speak(prompt);
        lastPrompt.current = prompt;
      }
    };

    window.addEventListener('voiceCommand', handleCommand);
    return () => window.removeEventListener('voiceCommand', handleCommand);
    // eslint-disable-next-line
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.post('/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      const prompt = 'Login successful. Welcome!';
      speak(prompt);
      lastPrompt.current = prompt;
    } catch (err) {
      const prompt = 'Login failed. Please try again or say "reset" to start over.';
      speak(prompt);
      setStep(0);
      lastPrompt.current = prompt;
    }
  };

  return (
    <div aria-live="polite">
      Login Page (Voice Controlled)
      <br />
      <span>
        (Say your username, then password, then "login". Say "reset" anytime to start over, or "repeat" to hear the last prompt.)
      </span>
    </div>
  );
};

export default Login;
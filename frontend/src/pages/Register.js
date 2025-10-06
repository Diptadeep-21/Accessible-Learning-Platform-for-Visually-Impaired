import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { speak } from '../utils/voiceUtils';

const Register = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(0); // 0: username, 1: password, 2: confirm, 3: done
  const lastPrompt = useRef('');
  const navigate = useNavigate();

  useEffect(() => {
    const prompt = 'Welcome to registration. Please say your desired username.';
    speak(prompt);
    lastPrompt.current = prompt;

    const handleCommand = (e) => {
      const command = e.detail.trim();
      if (command.includes('reset')) {
        setUsername('');
        setPassword('');
        setStep(0);
        const prompt = 'Resetting registration. Please say your desired username.';
        speak(prompt);
        lastPrompt.current = prompt;
        return;
      }
      if (command.includes('repeat')) {
        speak(lastPrompt.current);
        return;
      }

      if (step === 0) {
        setUsername(command);
        setStep(1);
        const prompt = `Username set to ${command}. Please say your desired password.`;
        speak(prompt);
        lastPrompt.current = prompt;
      } else if (step === 1) {
        setPassword(command);
        setStep(2);
        const prompt = 'Password set. Say "register" to complete registration or "reset" to start over.';
        speak(prompt);
        lastPrompt.current = prompt;
      } else if (step === 2 && command.includes('register')) {
        handleRegister();
      } else if (step === 2) {
        const prompt = 'Say "register" to complete registration or "reset" to start over.';
        speak(prompt);
        lastPrompt.current = prompt;
      } else if (step === 3 && command.includes('login')) {
        speak('Navigating to login page.');
        navigate('/login');
      }
    };

    window.addEventListener('voiceCommand', handleCommand);
    return () => window.removeEventListener('voiceCommand', handleCommand);
    // eslint-disable-next-line
  }, [step, navigate]);

  const handleRegister = async () => {
    try {
      await axios.post('/auth/register', { username, password });
      const prompt = 'Registration successful. Please say "login" to go to the login page.';
      speak(prompt);
      setStep(3);
      lastPrompt.current = prompt;
    } catch (err) {
      const prompt = 'Registration failed. Please try again or say "reset" to start over.';
      speak(prompt);
      setStep(0);
      lastPrompt.current = prompt;
    }
  };

  return (
    <div aria-live="polite">
      Register Page (Voice Controlled)
      <br />
      <span>
        (Say your username, then password, then "register". Say "reset" anytime to start over, or "repeat" to hear the last prompt. After successful registration, say "login" to go to the login page.)
      </span>
    </div>
  );
};

export default Register;
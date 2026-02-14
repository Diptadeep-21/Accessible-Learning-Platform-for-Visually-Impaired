// src/utils/voiceUtils.js
// Stable Voice Control System for Accessible Learning Platform

let recognition = null;
let isListening = false;
let onResultCallback = null;
let spacebarPressed = false;

let keyDownHandler = null;
let keyUpHandler = null;

// ---------------- SPEECH RECOGNITION ----------------
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    if (event.results.length > 0) {
      const transcript = event.results[0][0].transcript.trim();
      console.log('Voice command:', transcript);
      if (onResultCallback) onResultCallback(transcript);
    }
  };

  recognition.onerror = () => {
    isListening = false;
  };

  recognition.onend = () => {
    isListening = false;
  };
} else {
  console.error('Speech Recognition not supported');
}

// ---------------- TEXT TO SPEECH ----------------
export const speak = (text, onEnd = () => {}) => {
  window.speechSynthesis.cancel(); // Prevent overlapping speech
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

// ---------------- LISTENING CONTROL ----------------
const startListening = (callback) => {
  if (!recognition || isListening || !spacebarPressed) return;

  onResultCallback = callback;

  try {
    recognition.start();
    isListening = true;
  } catch (e) {
    console.warn('Recognition start failed');
  }
};

const stopListening = () => {
  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch (e) {}
    isListening = false;
  }
};

// ---------------- GLOBAL SPACEBAR HANDLER ----------------
export const setupSpacebarListening = (onVoiceCommand) => {
  // Remove previous handlers safely
  if (keyDownHandler) window.removeEventListener('keydown', keyDownHandler);
  if (keyUpHandler) window.removeEventListener('keyup', keyUpHandler);

  keyDownHandler = (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!spacebarPressed) {
        spacebarPressed = true;
        speak('Speak now');
        startListening(onVoiceCommand);
      }
    }
  };

  keyUpHandler = (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      spacebarPressed = false;
      stopListening();
    }
  };

  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup', keyUpHandler);

  console.log('Voice control activated');
};

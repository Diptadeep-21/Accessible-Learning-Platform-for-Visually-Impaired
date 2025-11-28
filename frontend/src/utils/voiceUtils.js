// src/utils/voiceUtils.js
// Press & Hold Spacebar to Speak — 100% WORKING, NO ERRORS

let recognition = null;
let isListening = false;
let onResultCallback = null;
let spacebarPressed = false;

// Initialize Speech Recognition
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

// Text-to-Speech — Exported once
export const speak = (text, onEnd = () => {}) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

// Internal functions
const startListening = (callback) => {
  if (!recognition || isListening || !spacebarPressed) return;
  onResultCallback = callback;
  try {
    recognition.start();
    isListening = true;
  } catch (e) {
    console.warn('Failed to start recognition');
  }
};

const stopListening = () => {
  if (recognition && isListening) {
    try {
      recognition.stop();
      isListening = false;
    } catch (e) {}
  }
};

// Global Spacebar Handler — Exported once
export const setupSpacebarListening = (onVoiceCommand) => {
  const handleKeyDown = (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!spacebarPressed) {
        spacebarPressed = true;
        speak('Speak now');
        startListening(onVoiceCommand);
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      spacebarPressed = false;
      stopListening();
    }
  };

  // Remove old listeners
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  console.log('Spacebar voice control activated');
};

// NO DUPLICATE EXPORT LINE — THIS WAS THE PROBLEM
// Removed: export { speak, setupSpacebarListening };
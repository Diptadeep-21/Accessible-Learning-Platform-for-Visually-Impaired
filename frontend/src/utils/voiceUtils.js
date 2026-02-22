// src/utils/voiceUtils.js
// Stable Voice Control System for Accessible Learning Platform

let recognition = null;
let isListening = false;
let onResultCallback = null;
let spacebarPressed = false;

let keyDownHandler = null;
let keyUpHandler = null;

// ---------------- SPEECH RECOGNITION ----------------
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    if (event.results.length > 0) {
      const transcript = event.results[0][0].transcript.trim();
      console.log("Voice command:", transcript);
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
  console.error("Speech Recognition not supported");
}

// ---------------- TEXT TO SPEECH ----------------
export const speak = (text, onEnd = () => {}) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
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
    console.warn("Recognition start failed");
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

// ---------------- REMOVE LISTENERS ----------------
export const removeSpacebarListening = () => {
  if (keyDownHandler) window.removeEventListener("keydown", keyDownHandler);
  if (keyUpHandler) window.removeEventListener("keyup", keyUpHandler);

  keyDownHandler = null;
  keyUpHandler = null;
  spacebarPressed = false;
  stopListening();

  console.log("Voice control removed");
};

// ---------------- GLOBAL SPACEBAR HANDLER ----------------
export const setupSpacebarListening = (onVoiceCommand) => {
  // First remove any existing listeners
  removeSpacebarListening();

keyDownHandler = (e) => {
  const activeElement = document.activeElement;

  // 🚫 Allow space in all editable elements
  if (
    activeElement &&
    (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.isContentEditable
    )
  ) {
    return;
  }

  if (e.code === "Space") {
    e.preventDefault();

    if (!spacebarPressed) {
      spacebarPressed = true;
      speak("Speak now");
      startListening(onVoiceCommand);
    }
  }
};

keyUpHandler = (e) => {
  const activeElement = document.activeElement;

  if (
    activeElement &&
    (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.isContentEditable
    )
  ) {
    return;
  }

  if (e.code === "Space") {
    e.preventDefault();
    spacebarPressed = false;
    stopListening();
  }
};

  window.addEventListener("keydown", keyDownHandler);
  window.addEventListener("keyup", keyUpHandler);

  console.log("Voice control activated");
};
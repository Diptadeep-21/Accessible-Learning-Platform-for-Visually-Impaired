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
    window.dispatchEvent(new Event("voiceProcessing"));
    const transcript = event.results[0][0].transcript.trim();
    console.log("Voice command:", transcript);

    // One RAF tick ensures child components' useEffect listeners
    // are fully attached before the command fires
    requestAnimationFrame(() => {
      if (onResultCallback) onResultCallback(transcript);
    });
  }
};

  recognition.onerror = () => {
    isListening = false;

    // ✅ NEW: stop animation if error
    window.dispatchEvent(new Event("voiceEnd"));
  };

  recognition.onend = () => {
    isListening = false;

    // ✅ NEW: stop animation when recognition ends
    window.dispatchEvent(new Event("voiceEnd"));
  };

} else {
  console.error("Speech Recognition not supported");
}

// ---------------- TEXT TO SPEECH ----------------

// Queue to hold utterances before voices are ready
let speechQueue = [];
let voicesReady = false;

const _doSpeak = (text, onEnd) => {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

const flushQueue = () => {
  // Drain queued utterances in order, only the last onEnd matters
  while (speechQueue.length > 0) {
    const { text, onEnd } = speechQueue.shift();
    _doSpeak(text, speechQueue.length === 0 ? onEnd : () => {});
  }
};

export const speak = (text, onEnd = () => {}) => {
  // If voices already confirmed ready, speak immediately
  if (voicesReady) {
    _doSpeak(text, onEnd);
    return;
  }

  // Check synchronously — Chrome often has voices on second call
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesReady = true;
    _doSpeak(text, onEnd);
    return;
  }

  // Voices not ready yet — queue and wait for the browser event
  speechQueue.push({ text, onEnd });

  // onvoiceschanged fires once when voices load (usually < 100ms after page load)
  window.speechSynthesis.onvoiceschanged = () => {
    voicesReady = true;
    window.speechSynthesis.onvoiceschanged = null; // clear after first fire
    flushQueue();
  };
};

// ---------------- LISTENING CONTROL ----------------
const startListening = (callback) => {
  if (!recognition || isListening || !spacebarPressed) return;

  onResultCallback = callback;

  try {
    recognition.start();
    isListening = true;

    // ✅ NEW: trigger listening animation
    window.dispatchEvent(new Event("voiceStart"));

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

    // ✅ NEW: trigger stop animation
    window.dispatchEvent(new Event("voiceEnd"));
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
  // Remove existing listeners first
  removeSpacebarListening();

  keyDownHandler = (e) => {
    const activeElement = document.activeElement;

    // 🚫 Allow space in input fields
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
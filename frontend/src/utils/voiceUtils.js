// Speech Recognition Setup
let recognition;
let isListening = false;
let onResultCallback = null;

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
} else {
  console.error('Speech Recognition not supported');
}

// TTS Setup
const speak = (text, onEnd = () => {}) => {
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
};

const startListening = (onResult) => {
  if (!recognition) return;
  onResultCallback = onResult;

  recognition.onresult = (event) => {
    const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    if (onResultCallback) onResultCallback(command);
  };

  recognition.onend = () => {
    isListening = false;
    // Restart listening automatically for continuous recognition
    try {
      recognition.start();
      isListening = true;
    } catch (e) {
      // Sometimes start() throws if called too quickly, so wait and retry
      setTimeout(() => {
        try {
          recognition.start();
          isListening = true;
        } catch (err) {}
      }, 500);
    }
  };

  recognition.onerror = (e) => {
    isListening = false;
    // Restart on error except for not-allowed errors
    if (e.error !== 'not-allowed') {
      setTimeout(() => {
        try {
          recognition.start();
          isListening = true;
        } catch (err) {}
      }, 500);
    }
  };

  if (!isListening) {
    try {
      recognition.start();
      isListening = true;
    } catch (e) {}
  }
};

const stopListening = () => {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
  }
};

export { speak, startListening, stopListening };
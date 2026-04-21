import { useState, useEffect, useCallback } from "react";
import { speak } from "../utils/voiceUtils";

export default function AIAssistant({ moduleText, setAIHandler }) {

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ MAIN FUNCTION
  const handleAction = useCallback(async (action) => {

    try {
      if (!moduleText) {
        speak("No module content available");
        return;
      }

      setLoading(true);
      speak("Processing, please wait");

      const res = await fetch("http://localhost:5000/api/ai/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: moduleText,
          action
        })
      });

      const data = await res.json();

      if (!data.success) throw new Error();

      setResponse(data.data);

      // 🔥 THIS IS WHY BUTTON WAS WORKING
      speak(data.data);

    } catch {
      speak("AI failed");
    } finally {
      setLoading(false);
    }

  }, [moduleText]);

  // ✅ 🔥 VERY IMPORTANT: REGISTER HANDLER TO PARENT
  useEffect(() => {
    if (setAIHandler) {
      setAIHandler(() => handleAction);
    }
  }, [handleAction, setAIHandler]);

  return (
    <div>
      <h3>AI Assistant</h3>

      <button onClick={() => handleAction("summarize")}>
        Summarize
      </button>

      <button onClick={() => handleAction("simple")}>
        Explain
      </button>

      <button onClick={() => handleAction("example")}>
        Example
      </button>

      {loading && <p>Processing...</p>}
      <p>{response}</p>
    </div>
  );
}
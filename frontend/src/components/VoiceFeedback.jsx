import { useEffect, useState } from "react";

const VoiceFeedback = () => {
  const [state, setState] = useState("idle"); 
  // idle | listening | processing

  useEffect(() => {
    const start = () => setState("listening");
    const end = () => {
      setState("processing");
      setTimeout(() => setState("idle"), 1500);
    };

    window.addEventListener("voiceStart", start);
    window.addEventListener("voiceEnd", end);

    return () => {
      window.removeEventListener("voiceStart", start);
      window.removeEventListener("voiceEnd", end);
    };
  }, []);

  return (
    <div style={{
      position: "fixed",
      bottom: "30px",
      left: "50%",
      transform: "translateX(-50%)",
      pointerEvents: "none",
      zIndex: 9999
    }}>
      {state === "listening" && (
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(0, 123, 255, 0.3)",
          animation: "pulse 1s infinite"
        }} />
      )}

      {state === "processing" && (
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "5px solid #007bff",
          borderTop: "5px solid transparent",
          animation: "spin 1s linear infinite"
        }} />
      )}
    </div>
  );
};

export default VoiceFeedback;
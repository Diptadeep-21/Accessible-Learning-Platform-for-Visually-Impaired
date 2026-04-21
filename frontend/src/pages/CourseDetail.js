import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  speak,
  setupSpacebarListening,
  removeSpacebarListening
} from "../utils/voiceUtils";

import AIAssistant from "../components/AIAssistant";

// ---------------- COMMAND NORMALIZER ----------------
const normalizeCommand = (cmd) => {
  const c = cmd.toLowerCase().trim();

  if (c.includes("next")) return "next";
  if (c.includes("repeat")) return "repeat";
  if (c.includes("quiz")) return "quiz";
  if (c.includes("help")) return "help";
  if (c.includes("where")) return "where";

  // AI navigation
  if (c.includes("assistant") || c.includes("ai")) return "ai";
  if (c.includes("back")) return "back";

  // ✅ FIX: handle ALL variations
  if (
    c.includes("summarize") ||
    c.includes("summarise") ||   // ✅ British spelling FIX
    c.includes("summary")
  ) return "summarize";

  if (
    c.includes("explain") ||
    c.includes("simple") ||
    c.includes("easy")
  ) return "simple";

  if (
    c.includes("example") ||
    c.includes("real") ||
    c.includes("instance")
  ) return "example";

  return "unknown";
};

const CourseDetail = () => {

  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState("learn");
  const [quizIndex, setQuizIndex] = useState(0);

  const [aiHandler, setAIHandler] = useState(null);

  const currentRef = useRef(0);
  const modeRef = useRef("learn");
  const quizRef = useRef(0);

  // Sync refs
  useEffect(() => {
    currentRef.current = current;
    modeRef.current = mode;
    quizRef.current = quizIndex;
  }, [current, mode, quizIndex]);

  // ---------------- FETCH COURSE ----------------
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${localStorage.getItem("token")}`;

        const res = await axios.get(
          `http://localhost:5000/api/courses/${id}`
        );

        setCourse(res.data);
        setCurrent(0);

      } catch {
        speak("Error fetching course.");
      }
    };

    fetchCourse();
  }, [id]);

  // ---------------- ORIENTATION ----------------
  useEffect(() => {
    if (!course) return;

    const userName = localStorage.getItem("name") || "User";

    speak(
      `Welcome ${userName}. 
      You are inside the course ${course.title}. 
      It has ${course.modules.length} modules and ${course.quizzes.length} quizzes. 
      Currently on module 1. 
      Say next, repeat, quiz, assistant, help or where am I.`
    );
  }, [course]);

  // ---------------- VOICE HANDLER ----------------
  useEffect(() => {
    if (!course) return;

    const handleCommand = (transcript) => {

      const action = normalizeCommand(transcript);
      console.log("MODE:", modeRef.current, "ACTION:", action);

      // ================= AI MODE (TOP PRIORITY) =================
      if (modeRef.current === "ai") {

  if (action === "back") {
    setMode("learn");
    modeRef.current = "learn";
    speak(`Returning to course. Module ${currentRef.current + 1}`);
  }

  else if (action === "summarize") {
    speak("Summarizing module");
    aiHandler?.("summarize");
  }

  else if (action === "simple") {
    speak("Explaining in simple terms");
    aiHandler?.("simple");
  }

  else if (action === "example") {
    speak("Giving example");
    aiHandler?.("example");
  }

  else {
    speak("Say summarize, explain, example, or back.");
  }

  return; // 🔥🔥🔥 CRITICAL (prevents fallback execution)
}

      // ================= LEARN MODE =================
      if (modeRef.current === "learn") {

        if (action === "next") {

          if (currentRef.current + 1 < course.modules.length) {
            const next = currentRef.current + 1;
            setCurrent(next);

            speak(`Module ${next + 1}. ${course.modules[next]}`);
          } else {
            speak("End of modules. Say quiz.");
          }
        }

        else if (action === "repeat") {

          speak(
            `Module ${currentRef.current + 1}. 
            ${course.modules[currentRef.current]}`
          );
        }

        else if (action === "quiz") {

          setMode("quiz");
          modeRef.current = "quiz";

          setQuizIndex(0);
          const q = course.quizzes[0];

          speak(
            `Question 1. ${q.question}. 
            Option A ${q.options[0]}, 
            B ${q.options[1]}, 
            C ${q.options[2]}, 
            D ${q.options[3]}.`
          );
        }

        else if (action === "ai") {

          setMode("ai");
          modeRef.current = "ai"; // 🔥 critical fix

          speak(
            `AI assistant activated. 
            Say summarize, explain, example, or back.`
          );
        }

        else if (action === "help") {

          speak(
            `Say next, repeat, quiz, assistant, or where am I.`
          );
        }

        else if (action === "where") {

          speak(
            `Course ${course.title}. Module ${currentRef.current + 1}.`
          );
        }

        else {
          speak("Command not recognized.");
        }
      }

      // ================= QUIZ MODE =================
      else if (modeRef.current === "quiz") {

        const q = course.quizzes[quizRef.current];
        const lower = transcript.toLowerCase();

        if (lower.includes("next")) {

          if (quizRef.current + 1 < course.quizzes.length) {

            const nextQ = quizRef.current + 1;
            setQuizIndex(nextQ);

            const newQ = course.quizzes[nextQ];

            speak(
              `Question ${nextQ + 1}. ${newQ.question}. 
              A ${newQ.options[0]}, 
              B ${newQ.options[1]}, 
              C ${newQ.options[2]}, 
              D ${newQ.options[3]}`
            );

          } else {

            speak("Quiz finished");
            setMode("learn");
            modeRef.current = "learn";
            setCurrent(0);
          }
          return;
        }

        let selectedIndex = -1;

        if (lower.includes("a")) selectedIndex = 0;
        else if (lower.includes("b")) selectedIndex = 1;
        else if (lower.includes("c")) selectedIndex = 2;
        else if (lower.includes("d")) selectedIndex = 3;

        if (selectedIndex !== -1) {

          const selected = q.options[selectedIndex];

          if (selected.toLowerCase() === q.answer.toLowerCase()) {
            speak("Correct");
          } else {
            speak(`Wrong. Correct answer is ${q.answer}`);
          }
          return;
        }

        speak("Say option A, B, C or D.");
      }
    };

    setupSpacebarListening(handleCommand);
    return () => removeSpacebarListening();

  }, [course, aiHandler]);

  // ---------------- UI ----------------
  return (
    <div aria-live="assertive" role="status">

      {mode === "ai" && course && (
        <AIAssistant
          moduleText={course.modules[current]}
          setAIHandler={setAIHandler}
        />
      )}

      {mode !== "ai" && (
        <p>Course Detail Voice Mode Active</p>
      )}

    </div>
  );
};

export default CourseDetail;
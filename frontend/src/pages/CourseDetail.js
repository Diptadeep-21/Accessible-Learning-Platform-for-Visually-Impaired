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
  if (c.includes("help")) return "help";
  if (c.includes("where")) return "where";
  if (c.includes("assistant") || c.includes("ai")) return "ai";
  if (c.includes("back")) return "back";

  if (
    c.includes("summarize") ||
    c.includes("summarise") ||
    c.includes("summary")
  )
    return "summarize";

  if (
    c.includes("explain") ||
    c.includes("simple") ||
    c.includes("easy")
  )
    return "simple";

  if (
    c.includes("example") ||
    c.includes("real") ||
    c.includes("instance")
  )
    return "example";

  return "unknown";
};

// ── Quiz answer: only match whole-word A/B/C/D, not letters inside words ──
// const detectQuizAnswer = (transcript) => {
//   // Matches "option a", "answer b", "choose c", or standalone "a"/"b"/"c"/"d"
//   const lower = transcript.toLowerCase();
//   const patterns = [
//     { letter: "a", index: 0 },
//     { letter: "b", index: 1 },
//     { letter: "c", index: 2 },
//     { letter: "d", index: 3 },
//   ];

//   for (const { letter, index } of patterns) {
//     // Match "option a", "answer a", or word-boundary " a " / starts/ends with a
//     const regex = new RegExp(`(?:option|answer|choose|pick)?\\s*\\b${letter}\\b`);
//     if (regex.test(lower)) return index;
//   }
//   return -1;
// };

const CourseDetail = () => {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState("learn");
  //const [quizIndex, setQuizIndex] = useState(0);
  const [aiHandler, setAIHandler] = useState(null);

  const currentRef = useRef(0);
  const modeRef = useRef("learn");
  //const quizRef    = useRef(0);
  const courseRef = useRef(null);   // ← lets voice handler always read fresh course

  // Sync refs
  useEffect(() => { currentRef.current = current; }, [current]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  //useEffect(() => { quizRef.current    = quizIndex; }, [quizIndex]);
  useEffect(() => { courseRef.current = course; }, [course]);

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
        speak("Error fetching course. Please go back and try again.");
      }
    };
    fetchCourse();
  }, [id]);

  // ---------------- ORIENTATION ----------------
  // Extracted as a function so any command can re-trigger it
  const speakOrientation = (courseData) => {
    const c = courseData || courseRef.current;

    if (!c) return;

    const modules = c.modules || [];
    //const quizzes = c.quizzes || [];

    const userName =
      localStorage.getItem("username") || "Student";

    speak(
      `Welcome ${userName}.
  You are inside the course ${c.title}.
  It contains ${modules.length} learning modules.
  You are currently on module ${currentRef.current + 1}.
  Say next to move to the next module.
  Say repeat to hear the current module again.
  Say assistant to use the AI assistant.
  Say help at any time to hear these commands again.`
    );
  };

  useEffect(() => {
    if (!course) return;
    speakOrientation(course);
  }, [course]);

  // ---------------- VOICE HANDLER ----------------
  useEffect(() => {
    if (!course) return;

    const handleCommand = (transcript) => {
      const action = normalizeCommand(transcript);
      const c = courseRef.current;
      const modNow = modeRef.current;
      const curNow = currentRef.current;
      //const qNow     = quizRef.current;

      console.log("MODE:", modNow, "ACTION:", action, "TRANSCRIPT:", transcript);

      // ══════════════════ AI MODE ══════════════════
      if (modNow === "ai") {
        if (action === "back") {
          setMode("learn");
          modeRef.current = "learn";
          speak(
            `Returning to course.
  Module ${curNow + 1}.
  Say next, repeat, assistant, or help.`
          );
        } else if (action === "summarize") {
          speak("Summarizing this module.");
          aiHandler?.("summarize");
        } else if (action === "simple") {
          speak("Explaining in simple terms.");
          aiHandler?.("simple");
        } else if (action === "example") {
          speak("Giving a real world example.");
          aiHandler?.("example");
        } else if (action === "repeat" || action === "help") {
          speak(
            `You are in the A I assistant. ` +
            `Say summarize to get a summary. ` +
            `Say explain for a simple explanation. ` +
            `Say example for a real world example. ` +
            `Say back to return to the course.`
          );
        } else if (action === "where") {
          speak(
            `You are in the A I assistant for ` +
            `module ${curNow + 1} of ${c.title}.`
          );
        } else {
          speak("Say summarize, explain, example, or back.");
        }
        return;
      }

      // ══════════════════ QUIZ MODE ══════════════════
      // if (modNow === "quiz") {
      //   const q = c.quizzes[qNow];

      //   if (action === "repeat" || action === "help") {
      //     // Re-read the current question in full
      //     speak(
      //       `Question ${qNow + 1} of ${c.quizzes.length}. ` +
      //       `${q.question}. ` +
      //       `Option A: ${q.options[0]}. ` +
      //       `Option B: ${q.options[1]}. ` +
      //       `Option C: ${q.options[2]}. ` +
      //       `Option D: ${q.options[3]}. ` +
      //       `Say A, B, C, or D to answer. ` +
      //       `Say next to skip this question.`
      //     );
      //     return;
      //   }

      //   if (action === "where") {
      //     speak(
      //       `You are on question ${qNow + 1} of ${c.quizzes.length} ` +
      //       `in the quiz for ${c.title}.`
      //     );
      //     return;
      //   }

      //   if (action === "back") {
      //     setMode("learn");
      //     modeRef.current = "learn";
      //     speak(
      //       `Exiting quiz. Back to module ${curNow + 1}. ` +
      //       `Say next, repeat, quiz, or help.`
      //     );
      //     return;
      //   }

      //   if (action === "next") {
      //     if (qNow + 1 < c.quizzes.length) {
      //       const nextQ = qNow + 1;
      //       setQuizIndex(nextQ);
      //       const nq = c.quizzes[nextQ];
      //       speak(
      //         `Question ${nextQ + 1} of ${c.quizzes.length}. ` +
      //         `${nq.question}. ` +
      //         `A: ${nq.options[0]}, ` +
      //         `B: ${nq.options[1]}, ` +
      //         `C: ${nq.options[2]}, ` +
      //         `D: ${nq.options[3]}.`
      //       );
      //     } else {
      //       speak(
      //         `Quiz finished. You have completed all ${c.quizzes.length} questions. ` +
      //         `Returning to course. Module ${curNow + 1}.`
      //       );
      //       setMode("learn");
      //       modeRef.current = "learn";
      //     }
      //     return;
      //   }

      //   // ── Answer detection (robust, word-boundary) ──
      //   const selectedIndex = detectQuizAnswer(transcript);

      //   if (selectedIndex !== -1) {
      //     const selected = q.options[selectedIndex];
      //     if (selected.toLowerCase() === q.answer.toLowerCase()) {
      //       speak(
      //         `Correct! The answer is ${q.answer}. ` +
      //         `Say next for the next question or repeat to hear this question again.`
      //       );
      //     } else {
      //       speak(
      //         `Wrong. You chose ${selected}. ` +
      //         `The correct answer is ${q.answer}. ` +
      //         `Say next to continue or repeat to hear the question again.`
      //       );
      //     }
      //     return;
      //   }

      //   speak("Say option A, B, C, or D to answer. Say repeat to hear the question again.");
      //   return;
      // }

      // ══════════════════ LEARN MODE ══════════════════
      if (modNow === "learn") {

        if (action === "next") {
          if (curNow + 1 < (c.modules || []).length) {
            const next = curNow + 1;
            setCurrent(next);
            speak(
              `Module ${next + 1} of ${(c.modules || []).length}.
  ${c.modules[next]}.
  Say next, repeat, assistant, or help.`
            );
          } else {
            speak(
              `You have reached the end of all modules.
  Say repeat to hear the last module again or say assistant for AI help.`
            );
          }
          return;
        }

        if (action === "repeat") {
          speak(
            `Module ${curNow + 1} of ${(c.modules || []).length}. ` +
            `${(c.modules || [])[curNow]}.`
          );
          return;
        }

        // if (action === "quiz") {
        //   if (!(c.quizzes || []).length) {
        //     speak("No quizzes available for this course.");
        //     return;
        //   }
        //   setMode("quiz");
        //   modeRef.current = "quiz";
        //   setQuizIndex(0);
        //   const q = (c.quizzes || [])[0];
        //   speak(
        //     `Starting quiz. ${c.quizzes.length} questions total. ` +
        //     `Question 1. ${q.question}. ` +
        //     `A: ${q.options[0]}, ` +
        //     `B: ${q.options[1]}, ` +
        //     `C: ${q.options[2]}, ` +
        //     `D: ${q.options[3]}. ` +
        //     `Say A, B, C, or D to answer.`
        //   );
        //   return;
        // }

        if (action === "ai") {
          setMode("ai");
          modeRef.current = "ai";
          speak(
            `A I assistant activated for module ${curNow + 1}. ` +
            `Say summarize, explain, example, or back.`
          );
          return;
        }

        if (action === "help") {
          // Full re-orientation — same as the welcome message
          speakOrientation();
          return;
        }

        if (action === "where") {
          speak(
            `You are in course ${c.title}, ` +
            `module ${curNow + 1} of ${c.modules.length}.`
          );
          return;
        }

        speak(
          `Command not recognized.` +
          `Say next, repeat, assistant, or help.`
        );
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
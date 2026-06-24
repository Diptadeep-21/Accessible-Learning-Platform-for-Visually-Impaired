import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  speak,
  setupSpacebarListening,
  removeSpacebarListening,
} from "../utils/voiceUtils";

const CourseList = () => {
  const [courses, setCourses]   = useState([]);
  const [quizzes, setQuizzes]   = useState([]);
  const [index, setIndex]       = useState(0);

  // Quiz-picking sub-mode
  // null = normal course mode
  // "picking" = user is selecting a quiz by number
  const [quizMode, setQuizMode]         = useState(null);
  const [activeQuizList, setActiveQuizList] = useState([]);

  const indexRef        = useRef(0);
  const quizModeRef     = useRef(null);
  const activeQuizRef   = useRef([]);
  const coursesRef      = useRef([]);
  const quizzesRef      = useRef([]);

  // Add alongside other refs at the top
const quizIndexRef = useRef(0);
const [quizIndex, setQuizIndex] = useState(0);
useEffect(() => { quizIndexRef.current = quizIndex; }, [quizIndex]);

  const navigate = useNavigate();

  // Keep refs in sync
  useEffect(() => { indexRef.current      = index;         }, [index]);
  useEffect(() => { quizModeRef.current   = quizMode;      }, [quizMode]);
  useEffect(() => { activeQuizRef.current = activeQuizList; }, [activeQuizList]);
  useEffect(() => { coursesRef.current    = courses;       }, [courses]);
  useEffect(() => { quizzesRef.current    = quizzes;       }, [quizzes]);

  // ---------------- NORMALIZER (local, handles all phrases) ----------------
  const normalize = (cmd) => {
    const c = cmd.toLowerCase().trim();
    if (c.includes("next"))                          return "next";
    if (c.includes("previous") || c.includes("prev") || c.includes("back")) return "previous";
    if (c.includes("open") || c.includes("start"))  return "open";
    if (c.includes("detail"))                        return "details";
    if (c.includes("progress"))                      return "progress";
    if (c.includes("list") || c.includes("all"))     return "list";
    if (c.includes("quiz"))                          return "quiz";   // "quiz", "quizzes", "list quizzes"
    if (c.includes("repeat") || c.includes("again")) return "repeat";
    if (c.includes("help"))                          return "help";
    // Number spoken to pick a quiz: "one","two"... or "1","2"...
    const spoken = ["one","two","three","four","five","six","seven","eight","nine","ten"];
    for (let i = 0; i < spoken.length; i++) {
      if (c.includes(spoken[i]) || c.includes(String(i + 1))) return `pick:${i}`;
    }
    return "unknown";
  };

  // ---------------- SPEAK HELPERS ----------------
  const speakCurrentCourse = (courseList, idx) => {
    const c = courseList[idx];
    speak(
      `Course ${idx + 1} of ${courseList.length}: ${c.title}. ` +
      `Say open to enter, details for description, ` +
      `quiz to see quizzes, next or previous to browse.`
    );
  };

  const speakWelcome = (courseList, quizList) => {
  const userName = localStorage.getItem("username") || "Student";
  const courseNames = courseList.map((c, i) => `${i + 1}. ${c.title}`).join(". ");
  const quizNames  = quizList.map((q, i)  => `${i + 1}. ${q.title}`).join(". ");

  speak(
    `Welcome ${userName}. ` +
    `You have ${courseList.length} courses available: ${courseNames}. ` +
    `You also have ${quizList.length} quizzes available: ${quizNames}. ` +
    `Say next or previous to browse courses. ` +
    `Say open to enter a course. ` +
    `Say quiz to browse quizzes. ` +
    `Say repeat to hear the current course again. ` +
    `Say help at any time to hear all commands.`
  );
};

  const speakHelp = () => {
  speak(
    `Available commands: ` +
    `Say next or previous to browse courses. ` +
    `Say open to enter the selected course. ` +
    `Say details to hear the course description. ` +
    `Say quiz to browse all available quizzes. ` +
    `Say list to hear all course names. ` +
    `Say repeat to hear the current course again. ` +
    `Say help to hear this message again.`
  );
};

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${localStorage.getItem("token")}`;

        const [courseRes, quizRes] = await Promise.all([
          axios.get("http://localhost:5000/api/courses"),
          axios.get("http://localhost:5000/api/quizzes"),
        ]);

        const approvedCourses = courseRes.data.filter((c) => c.isApproved);
        const approvedQuizzes = quizRes.data.filter((q) => q.isApproved);

        setCourses(approvedCourses);
        setQuizzes(approvedQuizzes);

        speakWelcome(approvedCourses, approvedQuizzes);
      } catch {
        speak("Error fetching courses. Please check your connection and try again.");
      }
    };
    fetchData();
  }, []);

  // ---------------- VOICE HANDLER ----------------
  useEffect(() => {
    if (!courses.length) return;

    const handleVoiceCommand = (transcript) => {
      const action       = normalize(transcript);
      const currentIndex = indexRef.current;
      const allCourses   = coursesRef.current;
      const allQuizzes   = quizzesRef.current;
      const currentCourse = allCourses[currentIndex];
      const inQuizPick   = quizModeRef.current === "picking";

      // ══════════════ QUIZ-PICKING SUB-MODE ══════════════
      // User heard the quiz list and is now saying a number to pick one
      if (inQuizPick) {
  const list     = activeQuizRef.current;
  const qIdx     = quizIndexRef.current;
  const current  = list[qIdx];

  if (action === "next") {
    const n = (qIdx + 1) % list.length;
    setQuizIndex(n);
    quizIndexRef.current = n;
    speak(`Quiz ${n + 1} of ${list.length}: ${list[n].title}. Say open to start.`);
    return;
  }

  if (action === "previous") {
    const p = (qIdx - 1 + list.length) % list.length;
    setQuizIndex(p);
    quizIndexRef.current = p;
    speak(`Quiz ${p + 1} of ${list.length}: ${list[p].title}. Say open to start.`);
    return;
  }

  if (action === "open") {
    speak(`Opening quiz: ${current.title}.`);
    setQuizMode(null);
    quizModeRef.current = null;
    navigate(`/quiz/${current._id}`);
    return;
  }

  if (action === "list") {
    const names = list.map((q, i) => `${i + 1}. ${q.title}`).join(". ");
    speak(`Available quizzes: ${names}.`);
    return;
  }

  if (action === "repeat" || action === "help") {
    speak(
      `Currently on quiz ${qIdx + 1} of ${list.length}: ${current.title}. ` +
      `Say next or previous to browse. Say open to start. Say back to return to courses.`
    );
    return;
  }

  if (action === "back" || action === "previous" /* already handled but safety */) {
    setQuizMode(null);
    quizModeRef.current = null;
    speakCurrentCourse(coursesRef.current, indexRef.current);
    return;
  }

  speak("Say next, previous, open, list, or back.");
  return;
}

      // ══════════════ NORMAL COURSE MODE ══════════════
      switch (action) {

        case "next": {
          const nextIdx = (currentIndex + 1) % allCourses.length;
          setIndex(nextIdx);
          indexRef.current = nextIdx;
          speakCurrentCourse(allCourses, nextIdx);
          break;
        }

        case "previous": {
          const prevIdx = (currentIndex - 1 + allCourses.length) % allCourses.length;
          setIndex(prevIdx);
          indexRef.current = prevIdx;
          speakCurrentCourse(allCourses, prevIdx);
          break;
        }

        case "open":
          speak(`Opening ${currentCourse.title}.`);
          navigate(`/course/${currentCourse._id}`);
          break;

        case "details": {
          const courseQuizzes = allQuizzes.filter(
            (q) => q.course?._id === currentCourse._id
          );
          speak(
            `${currentCourse.title}. ` +
            `${currentCourse.description || "No description available."} ` +
            `This course has ${currentCourse.modules?.length || 0} modules ` +
            `and ${courseQuizzes.length} quizzes. ` +
            `Say open to enter, or quiz to pick a quiz.`
          );
          break;
        }

        case "quiz": {
  if (!allQuizzes.length) {
    speak("No quizzes available right now. Check back later.");
    break;
  }

  // Enter quiz-browsing mode
  setActiveQuizList(allQuizzes);
  activeQuizRef.current = allQuizzes;
  setQuizMode("picking");
  quizModeRef.current = "picking";
  setQuizIndex(0);
  quizIndexRef.current = 0;

  const first = allQuizzes[0];
  speak(
    `${allQuizzes.length} quizzes available. ` +
    `Currently on quiz 1: ${first.title}. ` +
    `Say next or previous to browse quizzes. ` +
    `Say open to start this quiz. ` +
    `Say list to hear all quiz names. ` +
    `Say back to return to courses.`
  );
  break;
}

        case "list": {
          const names = allCourses
            .map((c, i) => `${i + 1}. ${c.title}`)
            .join(". ");
          speak(`${allCourses.length} courses available: ${names}.`);
          break;
        }

        case "repeat":
          speakCurrentCourse(allCourses, currentIndex);
          break;

        case "help":
          speakHelp();
          break;

        case "progress":
          speak(`Progress tracking coming soon for ${currentCourse.title}.`);
          break;

        default:
          speak(
            `Command not recognized. ` +
            `Say help to hear available commands.`
          );
      }
    };

    setupSpacebarListening(handleVoiceCommand);
    return () => removeSpacebarListening();
  }, [courses, quizzes, navigate]);

  return (
    <div aria-live="assertive" role="status">
      Voice Accessible Course List Active
    </div>
  );
};

export default CourseList;
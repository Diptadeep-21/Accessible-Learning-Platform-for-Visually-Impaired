import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { speak } from "../utils/voiceUtils";

const normalizeCommand = (cmd) => {
  const c = cmd.toLowerCase().trim();

  if (c.includes("list") || c.includes("show")) return "list";
  if (c.includes("next")) return "next";
  if (c.includes("previous") || c.includes("back")) return "previous";
  if (c.includes("details") || c.includes("info")) return "details";
  if (c.includes("progress") || c.includes("status")) return "progress";
  if (c.includes("open") || c.includes("start")) return "open";
  if (c.includes("help")) return "help";
  if (c.includes("where")) return "where";

  return "unknown";
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // ---------------- FETCH COURSES ----------------
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${localStorage.getItem("token")}`;

        const res = await axios.get(
          "http://localhost:5000/api/courses"
        );

        setCourses(res.data);

        if (res.data.length > 0) {
          const userName = localStorage.getItem("name") || "Student";

          speak(
            `Welcome ${userName}. ` +
              `You have ${res.data.length} courses available. ` +
              `Currently selected course is ${res.data[0].title}. ` +
              `Say next to browse courses, details to hear more, ` +
              `open to start the course, or say help.`
          );
        } else {
          speak("No courses available at the moment.");
        }
      } catch {
        speak("Error fetching courses.");
      }
    };

    fetchCourses();
  }, []);

  // ---------------- LISTEN TO GLOBAL VOICE ----------------
  useEffect(() => {
    const handleVoiceCommand = (event) => {
      if (!courses.length) return;

      const transcript = event.detail;
      const action = normalizeCommand(transcript);
      const currentCourse = courses[indexRef.current];

      switch (action) {
        case "list":
          speak(
            `${currentCourse.title}. ${currentCourse.description || "No description available."}`
          );
          break;

        case "next":
          const nextIndex = (indexRef.current + 1) % courses.length;
          setIndex(nextIndex);
          speak(
            `Now selected: ${courses[nextIndex].title}`
          );
          break;

        case "previous":
          const prevIndex =
            (indexRef.current - 1 + courses.length) %
            courses.length;
          setIndex(prevIndex);
          speak(
            `Now selected: ${courses[prevIndex].title}`
          );
          break;

        case "details":
          speak(
            `${currentCourse.title}. ` +
              `This course contains ${currentCourse.modules?.length || 0} modules ` +
              `and ${currentCourse.quizzes?.length || 0} quizzes.`
          );
          break;

        case "progress":
          speak(
            `You have not started ${currentCourse.title} yet.`
          );
          break;

        case "open":
          speak(`Opening ${currentCourse.title}`);
          navigate(`/course/${currentCourse._id}`);
          break;

        case "help":
          speak(
            `You are on the course list page. ` +
              `Say next, previous, details, open, or where.`
          );
          break;

        case "where":
          speak(
            `You are on the course list page. ` +
              `Selected course is ${currentCourse.title}.`
          );
          break;

        default:
          speak(
            `Command not recognized. Say help for available commands.`
          );
      }
    };

    window.addEventListener("voiceCommand", handleVoiceCommand);

    return () => {
      window.removeEventListener("voiceCommand", handleVoiceCommand);
    };
  }, [courses, navigate]);

  return (
    <div aria-live="assertive" role="status">
      Course List Voice Mode Active
    </div>
  );
};

export default CourseList;
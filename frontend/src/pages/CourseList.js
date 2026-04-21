import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { speak, setupSpacebarListening, removeSpacebarListening } from "../utils/voiceUtils";
import { normalizeCommand } from "../utils/commandUtils";

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

        const approvedCourses = res.data.filter(c => c.isApproved);

        setCourses(approvedCourses);

        if (approvedCourses.length > 0) {

          const userName = localStorage.getItem("name") || "Student";

          const courseNames = approvedCourses
            .map((c, i) => `${i + 1}. ${c.title}`)
            .join(", ");

          speak(
            `Welcome ${userName}. 
            You have ${approvedCourses.length} courses available. 
            The courses are ${courseNames}. 
            Currently selected course is ${approvedCourses[0].title}. 
            Press spacebar and say next or details or open.`
          );

        } else {
          speak("No courses available.");
        }

      } catch (error) {
        speak("Error fetching courses.");
      }

    };

    fetchCourses();

  }, []);

  // ---------------- VOICE COMMAND HANDLER ----------------
  useEffect(() => {

    const handleVoiceCommand = (transcript) => {

      if (!courses.length) return;

      const action = normalizeCommand(transcript);

      const currentIndex = indexRef.current;
      const currentCourse = courses[currentIndex];

      switch (action) {

        case "list":

          const names = courses
            .map((c, i) => `${i + 1}. ${c.title}`)
            .join(", ");

          speak(`Available courses are ${names}`);
          break;

        case "next":

          const nextIndex = (currentIndex + 1) % courses.length;

          setIndex(nextIndex);

          speak(`Now selected ${courses[nextIndex].title}.
            Press space and say open for details`);
          break;

        case "details":

          speak(
            `${currentCourse.title}. 
            ${currentCourse.description || "No description available."}. 
            This course has ${currentCourse.modules?.length || 0} modules 
            and ${currentCourse.quizzes?.length || 0} quizzes.`
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

        case "quiz":

          speak(`Starting quiz for ${currentCourse.title}`);

          navigate(`/course/${currentCourse._id}/quiz`);
          break;

        case "repeat":

          speak(
            `Currently selected course is ${currentCourse.title}. 
            Press space and say next, details, open, or quiz.`
          );
          break;

        default:

          speak("Command not recognized. Please try again.");
      }

    };

    // Activate spacebar listening
    setupSpacebarListening(handleVoiceCommand);

    return () => {
      removeSpacebarListening();
    };

  }, [courses, navigate]);

  return (
    <div aria-live="assertive" role="status">
      Voice Accessible Course List Active
    </div>
  );

};

export default CourseList;
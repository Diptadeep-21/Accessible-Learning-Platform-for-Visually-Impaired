import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { speak, setupSpacebarListening } from '../utils/voiceUtils';

const normalizeCommand = (cmd) => {
  const c = cmd.toLowerCase().trim();

  if (c.includes('list') || c.includes('least') || c.includes('show')) return 'list';
  if (c.includes('next') || c.includes('neck') || c.includes('text')) return 'next';
  if (c.includes('details') || c.includes('info')) return 'details';
  if (c.includes('progress') || c.includes('status')) return 'progress';
  if (c.includes('open') || c.includes('start') || c.includes('begin')) return 'open';
  if (c.includes('help')) return 'help';
  if (c.includes('where') || c.includes('location')) return 'where';

  return 'unknown';
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // ---------------- ORIENTATION SPEECH ----------------
  const announceOrientation = (courseList) => {
    const userName = localStorage.getItem('name') || 'User';

    speak(
      `Welcome ${userName}. ` +
      `You are on the course list page. ` +
      `Hold the spacebar and speak your command. ` +
      `You have ${courseList.length} courses available. ` +
      `Currently selected course is ${courseList[0].title}. ` +
      `Say list to hear description, next to browse courses, ` +
      `details for more information, progress to hear status, ` +
      `open to start the course, or say help for instructions.`
    );
  };

  // ---------------- FETCH COURSES ----------------
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        axios.defaults.headers.common['Authorization'] =
          `Bearer ${localStorage.getItem('token')}`;

        const res = await axios.get('http://localhost:5000/api/courses');
        setCourses(res.data);

      } catch {
        speak('Error fetching courses.');
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!courses.length) return;

    const userName = localStorage.getItem('name') || 'User';

    speak(
      `Welcome ${userName}. ` +
      `You are on the course list page. ` +
      `Hold the spacebar and speak your command. ` +
      `You have ${courses.length} courses available. ` +
      `Currently selected course is ${courses[0].title}. ` +
      `Say list, next, details, progress, open, or help.`
    );

  }, [courses]);

  // ---------------- VOICE COMMAND HANDLER ----------------
  useEffect(() => {
    if (!courses.length) return;

    const handleCommand = (transcript) => {
      const action = normalizeCommand(transcript);
      const currentCourse = courses[indexRef.current];

      switch (action) {

        case 'list':
          speak(
            `${currentCourse.title}. ${currentCourse.description}. ` +
            `Say details, progress, next, or open.`
          );
          break;

        case 'next':
          const nextIndex = (indexRef.current + 1) % courses.length;
          setIndex(nextIndex);
          speak(
            `Now selected: ${courses[nextIndex].title}. ` +
            `Say details or open.`
          );
          break;

        case 'details':
          speak(
            `${currentCourse.title}. ` +
            `This course contains ${currentCourse.modules?.length || 0} modules ` +
            `and ${currentCourse.quizzes?.length || 0} quizzes. ` +
            `Say open to start or next to browse.`
          );
          break;

        case 'progress':
          speak(
            `You have not started ${currentCourse.title} yet. ` +
            `Say open to begin learning.`
          );
          break;

        case 'open':
          speak(`Opening ${currentCourse.title}`);
          navigate(`/course/${currentCourse._id}`);
          break;

        case 'help':
          speak(
            `You are on the course list page. ` +
            `Hold spacebar and speak. ` +
            `Say list, next, details, progress, or open.`
          );
          break;

        case 'where':
          speak(
            `You are currently on the course list page. ` +
            `Selected course is ${currentCourse.title}.`
          );
          break;

        default:
          speak(
            `Command not recognized. ` +
            `Say help to hear available commands.`
          );
      }
    };

    setupSpacebarListening(handleCommand);

    return () => {
      window.speechSynthesis.cancel();
    };

  }, [courses, navigate]);

  return (
    <div aria-live="assertive" role="status">
      Course List Voice Mode Active
    </div>
  );
};

export default CourseList;
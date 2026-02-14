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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        axios.defaults.headers.common['Authorization'] =
          `Bearer ${localStorage.getItem('token')}`;

        const res = await axios.get('http://localhost:5000/api/courses');
        setCourses(res.data);

        if (res.data.length) {
          speak(
            `Welcome back. You have ${res.data.length} courses. ` +
            `Currently selected course is ${res.data[0].title}. ` +
            `Say list, next, details, progress, or open.`
          );
        } else {
          speak('No courses available.');
        }
      } catch {
        speak('Error fetching courses.');
      }
    };

    fetchCourses();
  }, []);

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
          speak(`${courses[nextIndex].title}. Say details or open.`);
          break;

        case 'details':
          speak(
            `${currentCourse.title}. ` +
            `This course has ${currentCourse.modules?.length || 0} modules ` +
            `and ${currentCourse.quizzes?.length || 0} quizzes.`
          );
          break;

        case 'progress':
          speak(`You have not started ${currentCourse.title} yet.`);
          break;

        case 'open':
          speak(`Opening ${currentCourse.title}`);
          navigate(`/course/${currentCourse._id}`);
          break;

        default:
          speak('Command not recognized. Say list, next, details, progress, or open.');
      }
    };

    setupSpacebarListening(handleCommand);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [courses, navigate]);

  return (
    <div aria-live="assertive" role="status">
      Voice Course List Active
    </div>
  );
};

export default CourseList;
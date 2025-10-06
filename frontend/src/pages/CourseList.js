import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { speak } from '../utils/voiceUtils';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        const res = await axios.get('/courses');
        setCourses(res.data);
        speak(`Found ${res.data.length} courses. Say next to hear the next one, or select number to open.`);
      } catch (err) {
        speak('Error fetching courses.');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleCommand = (e) => {
      const command = e.detail;
      if (command.includes('next')) {
        setSelectedIndex((prev) => {
          const next = (prev + 1) % courses.length;
          speak(courses[next].title + '. ' + courses[next].description);
          return next;
        });
      } else if (command.match(/select (\d+)/)) {
        const index = parseInt(command.match(/select (\d+)/)[1]) - 1;
        if (index < courses.length) {
          speak(`Opening course: ${courses[index].title}`);
          // Navigate to detail (use Router or state)
          window.location.href = `/course/${courses[index]._id}`;
        }
      }
    };
    window.addEventListener('voiceCommand', handleCommand);
    return () => window.removeEventListener('voiceCommand', handleCommand);
  }, [courses]);

  return <div aria-live="polite">Course List (Voice Navigation)</div>;
};

export default CourseList;
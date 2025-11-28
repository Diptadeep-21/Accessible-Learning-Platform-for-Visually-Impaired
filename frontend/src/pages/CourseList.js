import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { speak } from '../utils/voiceUtils';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        const res = await axios.get('http://localhost:5000/api/courses');
        setCourses(res.data);
        if (res.data.length)
          speak(`Found ${res.data.length} courses. Say next to hear each, or say open one to start.`);
      } catch {
        speak('Error fetching courses.');
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleCommand = (e) => {
      const command = e.detail.toLowerCase();
      if (command.includes('next')) {
        setIndex((prev) => {
          const next = (prev + 1) % courses.length;
          speak(courses[next].title + '. ' + courses[next].description);
          return next;
        });
      } else if (command.includes('open')) {
        window.location.href = `/course/${courses[index]._id}`;
      }
    };
    window.addEventListener('voiceCommand', handleCommand);
    return () => window.removeEventListener('voiceCommand', handleCommand);
  }, [courses, index]);

  return <div aria-live="polite">Voice Course List</div>;
};

export default CourseList;

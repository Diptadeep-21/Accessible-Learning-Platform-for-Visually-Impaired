import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { speak } from '../utils/voiceUtils';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState('learn'); // learn or quiz
  const [quizIndex, setQuizIndex] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        const res = await axios.get(`http://localhost:5000/api/courses/${id}`);
        setCourse(res.data);
        speak(`Course: ${res.data.title}. Say next to start the first module.`);
      } catch {
        speak('Error fetching course.');
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (!course) return;
    const handleCommand = (e) => {
      const cmd = e.detail.toLowerCase();

      if (mode === 'learn') {
        if (cmd.includes('next')) {
          if (current + 1 < course.modules.length) {
            setCurrent(current + 1);
            speak(course.modules[current + 1]);
          } else {
            speak('You have reached the end of modules. Say quiz to begin your test.');
          }
        } else if (cmd.includes('repeat')) {
          speak(course.modules[current]);
        } else if (cmd.includes('quiz')) {
          setMode('quiz');
          setQuizIndex(0);
          speak(course.quizzes[0].question + ' Options: ' + course.quizzes[0].options.join(', '));
        }
      } else if (mode === 'quiz') {
        const answer = course.quizzes[quizIndex].answer.toLowerCase();
        if (cmd.includes(answer)) {
          speak('Correct!');
        } else {
          speak('Incorrect. The correct answer is ' + answer);
        }
        if (quizIndex + 1 < course.quizzes.length) {
          setQuizIndex(quizIndex + 1);
          speak(course.quizzes[quizIndex + 1].question + ' Options: ' + course.quizzes[quizIndex + 1].options.join(', '));
        } else {
          speak('Quiz complete. Congratulations!');
          setMode('learn');
        }
      }
    };
    window.addEventListener('voiceCommand', handleCommand);
    return () => window.removeEventListener('voiceCommand', handleCommand);
  }, [course, current, quizIndex, mode]);

  return <div aria-live="polite">Course Detail (Interactive Audio Mode)</div>;
};

export default CourseDetail;

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { speak, setupSpacebarListening } from '../utils/voiceUtils';

const normalizeCommand = (cmd) => {
  const c = cmd.toLowerCase();

  if (c.includes('next')) return 'next';
  if (c.includes('repeat')) return 'repeat';
  if (c.includes('quiz')) return 'quiz';

  return 'unknown';
};

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState('learn');
  const [quizIndex, setQuizIndex] = useState(0);

  const currentRef = useRef(0);
  const modeRef = useRef('learn');
  const quizRef = useRef(0);

  useEffect(() => {
    currentRef.current = current;
    modeRef.current = mode;
    quizRef.current = quizIndex;
  }, [current, mode, quizIndex]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        axios.defaults.headers.common['Authorization'] =
          `Bearer ${localStorage.getItem('token')}`;

        const res = await axios.get(
          `http://localhost:5000/api/courses/${id}`
        );

        setCourse(res.data);
        setCurrent(0);

        speak(
          `Course ${res.data.title}. ` +
          `First module: ${res.data.modules[0]}. ` +
          `Say next to continue, repeat, or quiz to start test.`
        );
      } catch {
        speak('Error fetching course.');
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (!course) return;

    const handleCommand = (transcript) => {
      const action = normalizeCommand(transcript);

      if (modeRef.current === 'learn') {
        if (action === 'next') {
          if (currentRef.current + 1 < course.modules.length) {
            const next = currentRef.current + 1;
            setCurrent(next);
            speak(course.modules[next]);
          } else {
            speak('End of modules. Say quiz to start test.');
          }
        } else if (action === 'repeat') {
          speak(course.modules[currentRef.current]);
        } else if (action === 'quiz') {
          setMode('quiz');
          setQuizIndex(0);
          const q = course.quizzes[0];
          speak(
            `${q.question}. 
Option A: ${q.options[0]}. 
Option B: ${q.options[1]}. 
Option C: ${q.options[2]}. 
Option D: ${q.options[3]}. 
Please say option A, B, C or D.`
          );
        } else {
          speak('Say next, repeat, or quiz.');
        }
      }

      else if (modeRef.current === 'quiz') {
        const q = course.quizzes[quizRef.current];
        const lower = transcript.toLowerCase().trim();

        // --- STEP 1: Handle NEXT ---
        if (lower === 'next' || lower.includes('next question')) {
          if (quizRef.current + 1 < course.quizzes.length) {
            const nextQ = quizRef.current + 1;
            setQuizIndex(nextQ);

            const newQ = course.quizzes[nextQ];
            speak(
              `${newQ.question}. ` +
              `Option A: ${newQ.options[0]}. ` +
              `Option B: ${newQ.options[1]}. ` +
              `Option C: ${newQ.options[2]}. ` +
              `Option D: ${newQ.options[3]}. ` +
              `Please say option A, B, C or D.`
            );
          } else {
            speak('Quiz finished. Returning to lessons.');
            setMode('learn');
            setCurrent(0);
          }
          return;
        }

        // --- STEP 2: Detect Option Letter ---
        let selectedIndex = -1;

        if (lower.includes('option a') || lower === 'a' || lower.includes('first')) {
          selectedIndex = 0;
        }
        else if (lower.includes('option b') || lower === 'b' || lower.includes('second')) {
          selectedIndex = 1;
        }
        else if (lower.includes('option c') || lower === 'c' || lower.includes('third')) {
          selectedIndex = 2;
        }
        else if (lower.includes('option d') || lower === 'd' || lower.includes('fourth')) {
          selectedIndex = 3;
        }

        // --- STEP 3: Evaluate ---
        if (selectedIndex !== -1) {
          const selectedAnswer = q.options[selectedIndex];

          if (selectedAnswer.toLowerCase() === q.answer.toLowerCase()) {
            speak('Correct answer. Say next for next question.');
          } else {
            speak(`Wrong answer. The correct answer is ${q.answer}. Say next.`);
          }
          return;
        }

        speak('Please answer by saying option A, B, C or D.');
      }
    };

    setupSpacebarListening(handleCommand);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [course]);

  return (
    <div aria-live="assertive" role="status">
      Audio Course Mode Active
    </div>
  );
};

export default CourseDetail;
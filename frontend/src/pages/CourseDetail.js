import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { speak, setupSpacebarListening } from '../utils/voiceUtils';

const normalizeCommand = (cmd) => {
  const c = cmd.toLowerCase().trim();

  if (c.includes('next')) return 'next';
  if (c.includes('repeat')) return 'repeat';
  if (c.includes('quiz')) return 'quiz';
  if (c.includes('help')) return 'help';
  if (c.includes('where')) return 'where';

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

  // ---------------- FETCH COURSE ----------------
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

      } catch {
        speak('Error fetching course.');
      }
    };

    fetchCourse();
  }, [id]);

  // ---------------- ORIENTATION SPEECH ----------------
  useEffect(() => {
    if (!course) return;

    const userName = localStorage.getItem('name') || 'User';

    speak(
      `Welcome ${userName}. ` +
      `You are inside the course ${course.title}. ` +
      `This course contains ${course.modules.length} modules ` +
      `and ${course.quizzes.length} quizzes. ` +
      `Currently on module 1. ` +
      `Say next to continue, repeat to hear again, ` +
      `quiz to start test, help for commands, ` +
      `or say where am I to hear your location.`
    );

  }, [course]);

  // ---------------- VOICE HANDLER ----------------
  useEffect(() => {
    if (!course) return;

    const handleCommand = (transcript) => {
      const action = normalizeCommand(transcript);

      // ---------- LEARN MODE ----------
      if (modeRef.current === 'learn') {

        if (action === 'next') {
          if (currentRef.current + 1 < course.modules.length) {
            const next = currentRef.current + 1;
            setCurrent(next);
            speak(
              `Module ${next + 1}. ${course.modules[next]}`
            );
          } else {
            speak('End of modules. Say quiz to start test.');
          }
        }

        else if (action === 'repeat') {
          speak(
            `Module ${currentRef.current + 1}. ` +
            `${course.modules[currentRef.current]}`
          );
        }

        else if (action === 'quiz') {
          setMode('quiz');
          setQuizIndex(0);
          const q = course.quizzes[0];

          speak(
            `Starting quiz. Question 1. ${q.question}. ` +
            `Option A: ${q.options[0]}. ` +
            `Option B: ${q.options[1]}. ` +
            `Option C: ${q.options[2]}. ` +
            `Option D: ${q.options[3]}. ` +
            `Please say option A, B, C or D.`
          );
        }

        else if (action === 'help') {
          speak(
            `You are inside ${course.title}. ` +
            `Say next, repeat, quiz, or where am I.`
          );
        }

        else if (action === 'where') {
          speak(
            `You are inside course ${course.title}. ` +
            `Currently on module ${currentRef.current + 1}.`
          );
        }

        else {
          speak('Command not recognized. Say help for options.');
        }
      }

      // ---------- QUIZ MODE ----------
      else if (modeRef.current === 'quiz') {

        const q = course.quizzes[quizRef.current];
        const lower = transcript.toLowerCase().trim();

        // NEXT QUESTION
        if (lower === 'next' || lower.includes('next question')) {
          if (quizRef.current + 1 < course.quizzes.length) {
            const nextQ = quizRef.current + 1;
            setQuizIndex(nextQ);

            const newQ = course.quizzes[nextQ];

            speak(
              `Question ${nextQ + 1}. ${newQ.question}. ` +
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

        // OPTION DETECTION
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
      Course Detail Voice Mode Active
    </div>
  );
};

export default CourseDetail;
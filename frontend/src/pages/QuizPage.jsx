import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  speak,
  setupSpacebarListening,
  removeSpacebarListening,
} from "../utils/voiceUtils";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const quizRef = useRef(null);
  const questionIndexRef = useRef(0);
  const scoreRef = useRef(0);

  useEffect(() => {
    questionIndexRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // ---------------- FETCH QUIZ ----------------

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;

        const res = await axios.get(
          `http://localhost:5000/api/quizzes/${id}`
        );

        setQuiz(res.data);
        quizRef.current = res.data;

        speak(
          `Quiz ${res.data.title} loaded.
          There are ${res.data.questions.length} questions.
          Say start quiz to begin.`
        );
      } catch (err) {
        speak("Unable to load quiz.");
      }
    };

    fetchQuiz();
  }, [id]);

  // ---------------- READ QUESTION ----------------

const readQuestion = useCallback((index) => {
  if (!quizRef.current) return;

  const q = quizRef.current.questions[index];

  speak(
    `Question ${index + 1}.
    ${q.question}.
    Option A ${q.options[0]}.
    Option B ${q.options[1]}.
    Option C ${q.options[2]}.
    Option D ${q.options[3]}.
    Say option A, option B, option C or option D.`
  );
}, []);

  // ---------------- FINISH QUIZ ----------------
const finishQuiz = useCallback(() => {
  setCompleted(true);

  const total = quizRef.current.questions.length;
  const finalScore = scoreRef.current;
  const percent = Math.round((finalScore / total) * 100);

  let feedback = "";
  if (percent >= 80)      feedback = "Excellent performance.";
  else if (percent >= 60) feedback = "Good job.";
  else                    feedback = "Keep practicing.";

  speak(
    `Quiz completed. ` +
    `You scored ${finalScore} out of ${total}. ` +
    `${feedback}. ` +
    `Say home to return to courses.`
  );
}, []); // only uses refs

// ---------------- NEXT QUESTION ----------------
const nextQuestion = useCallback(() => {
  const next = questionIndexRef.current + 1;

  if (next >= quizRef.current.questions.length) {
    finishQuiz();
    return;
  }

  questionIndexRef.current = next;
  setCurrentQuestion(next);

  setTimeout(() => {
    readQuestion(next);
  }, 1000);
}, [finishQuiz, readQuestion]);

// ---------------- CHECK ANSWER ----------------
const evaluateAnswer = useCallback((answerIndex) => {
  const q = quizRef.current.questions[questionIndexRef.current];
  const selected = q.options[answerIndex];

  if (selected.trim().toLowerCase() === q.answer.trim().toLowerCase()) {
    const newScore = scoreRef.current + 1;
    scoreRef.current = newScore;
    setScore(newScore);
    speak("Correct answer.");
  } else {
    speak(`Wrong answer. The correct answer is ${q.answer}.`);
  }

  setTimeout(() => {
    nextQuestion();
  }, 2500);
}, [nextQuestion]); // depends on nextQuestion

  // ---------------- VOICE COMMANDS ----------------

  useEffect(() => {
  const handleVoice = (transcript) => {
    const command = transcript.trim().toLowerCase();

    if (!quizRef.current) return;

    if (completed) {
      if (command.includes("home")) {
        navigate("/courses");
        return;
      }

      if (command.includes("repeat")) {
        finishQuiz();
        return;
      }

      return;
    }

    if (command.includes("start") || command.includes("begin")) {
      readQuestion(questionIndexRef.current);
      return;
    }

    if (command.includes("repeat")) {
      readQuestion(questionIndexRef.current);
      return;
    }

    if (
      command.includes("option a") ||
      command === "a" ||
      command === "one"
    ) {
      evaluateAnswer(0);
      return;
    }

    if (
      command.includes("option b") ||
      command === "b" ||
      command === "two"
    ) {
      evaluateAnswer(1);
      return;
    }

    if (
      command.includes("option c") ||
      command === "c" ||
      command === "three"
    ) {
      evaluateAnswer(2);
      return;
    }

    if (
      command.includes("option d") ||
      command === "d" ||
      command === "four"
    ) {
      evaluateAnswer(3);
      return;
    }

    speak(
      "Command not recognized. Say option A, option B, option C or option D."
    );
  };

  setupSpacebarListening(handleVoice);

  return () => {
    removeSpacebarListening();
  };
}, [completed, navigate, evaluateAnswer, finishQuiz, readQuestion]);

  if (!quiz) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontSize: "24px",
        }}
      >
        Loading Quiz...
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "30px",
        background: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      }}
      aria-live="assertive"
    >
      <h1>{quiz.title}</h1>

      <p>{quiz.description}</p>

      {!completed ? (
        <>
          <h2>
            Question {currentQuestion + 1} of {totalQuestions}
          </h2>

          <div
            style={{
              marginTop: "20px",
              padding: "20px",
              background: "#f5f5f5",
              borderRadius: "10px",
            }}
          >
            <h3>{quiz.questions[currentQuestion].question}</h3>

            <ul style={{ listStyle: "none", padding: 0 }}>
              {quiz.questions[currentQuestion].options.map(
                (option, index) => (
                  <li
                    key={index}
                    style={{
                      padding: "12px",
                      marginTop: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </li>
                )
              )}
            </ul>
          </div>

          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              background: "#eef4ff",
              borderRadius: "10px",
            }}
          >
            <strong>Voice Commands</strong>

            <p>Hold SPACE and say:</p>

            <p>
              Start Quiz • Repeat • Option A • Option B •
              Option C • Option D
            </p>
          </div>
        </>
      ) : (
        <>
          <h2>Quiz Completed</h2>

          <h3>
            Score: {score} / {totalQuestions}
          </h3>

          <button
            onClick={() => navigate("/courses")}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              background: "#4f46e5",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Back to Courses
          </button>
        </>
      )}
    </div>
  );
};

export default QuizPage;
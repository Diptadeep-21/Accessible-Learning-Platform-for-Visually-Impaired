import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { speak } from "../utils/voiceUtils";
import heroImage from "../hero1.png";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    speak(
      "Welcome to Accessible Learning Platform. Say start learning, login, or register."
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f2a] text-white flex items-center justify-center px-6">

      {/* Container */}
      <div className="grid md:grid-cols-2 gap-10 items-center max-w-6xl w-full">

        {/* LEFT SIDE */}
        <div>
          <p className="bg-blue-900 inline-block px-4 py-1 rounded-full text-sm mb-4">
            Designed for Accessibility
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Empowering Minds. <br />
            <span className="text-blue-400">Enabling Futures.</span>
          </h1>

          <p className="text-gray-300 mb-8">
            An AI-powered learning platform for visually impaired students.
            Navigate using voice and learn through audio-based content.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/courses")}
              className="bg-blue-600 px-6 py-3 rounded-lg text-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
            >
              🎤 Start Learning
            </button>

            <button
              onClick={() => navigate("/login")}
              className="border border-gray-400 px-6 py-3 rounded-lg text-lg hover:bg-white hover:text-black"
            >
              Login
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-10 text-sm text-gray-300">
            <div>🎙️ Voice Navigation</div>
            <div>🎧 Audio Lessons</div>
            <div>🤖 AI Summaries</div>
            <div>🔒 Secure Access</div>
          </div>
        </div>

        {/* RIGHT SIDE (ILLUSTRATION) */}
        <div className="hidden md:flex justify-center relative">
          <div className="absolute w-96 h-96 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>

          <img
            src={heroImage}
            alt="Voice learning illustration"
            className="relative w-full max-w-md mix-blend-lighten"
          />
        </div>
      </div>

      {/* Hidden accessibility instructions */}
      <div className="sr-only">
        Press spacebar and speak commands like start learning, login, or register.
      </div>
    </div>
  );
};

export default Home;
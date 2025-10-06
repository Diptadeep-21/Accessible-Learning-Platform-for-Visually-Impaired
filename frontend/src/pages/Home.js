import React, { useEffect } from 'react';
import { speak } from '../utils/voiceUtils';

const Home = () => {
  useEffect(() => {
    speak(
      'Welcome home. Say courses to browse learning materials, profile for settings, login to sign in, or register to create a new account.'
    );
  }, []);

  return (
    <div aria-live="polite">
      Home Page
      <br />
      <span>
        (Say: "courses", "profile", "login", or "register" to navigate.)
      </span>
    </div>
  );
};

export default Home;
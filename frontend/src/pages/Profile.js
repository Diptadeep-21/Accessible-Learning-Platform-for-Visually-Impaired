import React, { useEffect } from 'react';
import { speak } from '../utils/voiceUtils';

const Profile = () => {
  useEffect(() => {
    speak('Profile page. Say update password or something. (Extend as needed)');
  }, []);

  return <div aria-live="polite">Profile Page</div>;
};

export default Profile;
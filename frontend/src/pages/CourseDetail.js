import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { speak } from '../utils/voiceUtils';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        const res = await axios.get(`/courses/${id}`);
        setCourse(res.data);
        speak(`Course: ${res.data.title}. Description: ${res.data.description}. Say play to hear content.`);
      } catch (err) {
        speak('Error fetching course.');
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (course) {
      const handleCommand = (e) => {
        const command = e.detail;
        if (command.includes('play')) {
          speak(course.content); // TTS the content
        } else if (command.includes('pause')) {
          speechSynthesis.pause();
        } else if (command.includes('resume')) {
          speechSynthesis.resume();
        } else if (command.includes('stop')) {
          speechSynthesis.cancel();
        }
      };
      window.addEventListener('voiceCommand', handleCommand);
      return () => window.removeEventListener('voiceCommand', handleCommand);
    }
  }, [course]);

  return <div aria-live="polite">Course Detail (Voice Playback)</div>;
};

export default CourseDetail;
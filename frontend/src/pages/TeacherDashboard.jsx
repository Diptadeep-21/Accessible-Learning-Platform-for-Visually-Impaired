import React, { useState } from 'react';
import axios from 'axios';

const TeacherDashboard = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState(['']);
  const [quizzes, setQuizzes] = useState([]);

  const addModule = () => {
    setModules([...modules, '']);
  };

  const handleModuleChange = (index, value) => {
    const updated = [...modules];
    updated[index] = value;
    setModules(updated);
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/courses',
        {
          title,
          description,
          modules,
          quizzes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      alert('Course uploaded successfully');
    } catch {
      alert('Upload failed');
    }
  };

  return (
    <div>
      <h2>Upload New Course</h2>

      <input
        placeholder="Course Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <h3>Modules</h3>
      {modules.map((mod, i) => (
        <textarea
          key={i}
          placeholder={`Module ${i + 1}`}
          value={mod}
          onChange={(e) => handleModuleChange(i, e.target.value)}
        />
      ))}

      <button onClick={addModule}>Add Module</button>

      <button onClick={handleSubmit}>Upload Course</button>
    </div>
  );
};

export default TeacherDashboard;
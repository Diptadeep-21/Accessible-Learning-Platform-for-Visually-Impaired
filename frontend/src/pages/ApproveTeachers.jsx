import { useEffect, useState } from "react";
import axios from "axios";

const ApproveTeachers = () => {
  const [teachers, setTeachers] = useState([]);

  const fetchPending = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:5000/api/admin/pending-teachers",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setTeachers(res.data);
  };

  const approveTeacher = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:5000/api/admin/approve-teacher/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    fetchPending();
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div>
      <h3>Pending Teacher Approvals</h3>
      {teachers.length === 0 ? (
        <p>No pending teachers</p>
      ) : (
        teachers.map((teacher) => (
          <div key={teacher._id} style={cardStyle}>
            <p><strong>Name:</strong> {teacher.username}</p>
            <p><strong>Email:</strong> {teacher.email}</p>
            <button onClick={() => approveTeacher(teacher._id)}>
              Approve
            </button>
          </div>
        ))
      )}
    </div>
  );
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  margin: "10px 0",
  borderRadius: "8px"
};

export default ApproveTeachers;
import { useEffect, useState } from "react";
import axios from "axios";

const ApproveCourses = () => {
  const [courses, setCourses] = useState([]);

  const fetchPendingCourses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/admin/pending-courses",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const approveCourse = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/admin/approve-course/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchPendingCourses();
    } catch (error) {
      console.error("Error approving course:", error);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  return (
    <div>
      <h3>Pending Course Approvals</h3>

      {courses.length === 0 ? (
        <p>No pending courses</p>
      ) : (
        courses.map((course) => (
          <div key={course._id} style={cardStyle}>
            <p><strong>Title:</strong> {course.title}</p>
            <p><strong>Description:</strong> {course.description}</p>
            <p>
              <strong>Teacher:</strong>{" "}
              {course.teacher?.username || "Unknown"}
            </p>

            <button
              style={approveBtnStyle}
              onClick={() => approveCourse(course._id)}
            >
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

const approveBtnStyle = {
  padding: "8px 12px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default ApproveCourses;
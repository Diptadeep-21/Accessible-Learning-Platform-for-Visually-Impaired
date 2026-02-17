import { useEffect, useState } from "react";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:5000/api/admin/users",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setUsers(res.data);
  };

  const disableUser = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:5000/api/admin/toggle-user/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h3>All Users</h3>
      {users.map((user) => (
        <div key={user._id} style={cardStyle}>
          <p>{user.username} ({user.role})</p>
          <button onClick={() => disableUser(user._id)}>
            {user.isActive ? "Disable" : "Enable"}
          </button>
        </div>
      ))}
    </div>
  );
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  margin: "10px 0",
  borderRadius: "8px"
};

export default ManageUsers;
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post(
                "http://localhost:5000/api/auth/teacher-login",
                { email, password }
            );

            if (res.data.role !== "admin") {
                alert("Not authorized as admin");
                return;
            }

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);   // ✅ ADD THIS

            navigate("/admin-dashboard");

        } catch (err) {
            alert(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div style={{ padding: 40, maxWidth: 300, margin: "auto" }}>
            <h2>Admin Login</h2>

            <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", marginBottom: 10 }}
            />

            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default AdminLogin;
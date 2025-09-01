import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                navigate("/app/login"); // token yoksa login sayfasına yönlendir
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                const response = await axios.get(
                    `https://localhost:44359/api/users/getbyid/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setUser(response.data.data);
                } else {
                    navigate("/app/login");
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                navigate("/app/login");
            }
        };

        fetchUser();
    }, [navigate]);

    if (!user) {
        return <div className="profile-container">Loading user information...</div>;
    }

    return (
        <div className="profile-container">
            <h2>User Profile</h2>
            <div className="profile-card">
                <p><strong>First Name:</strong> {user.firstName}</p>
                <p><strong>Last Name:</strong> {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <button onClick={() => navigate("/")}>Back to Home</button>
            </div>
        </div>
    );
}

export default Profile;

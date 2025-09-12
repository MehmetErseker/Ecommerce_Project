import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Profile.css";
import NavigationBar from "./NavigationBar"; // ✅ Ortak navbar

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                navigate("/app/login");
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const userId =
                    decoded[
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                    ];

                const response = await axios.get(
                    `https://localhost:44359/api/users/getbyid/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    const userData = response.data.data;
                    setUser(userData);
                } else {
                    setError("Failed to load user data");
                    setTimeout(() => navigate("/app/login"), 2000);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setError("Failed to load user information");
                setTimeout(() => navigate("/app/login"), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        toast.success("Logged out successfully!");
        navigate("/");
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    const handleViewCart = () => {
        navigate("/app/cart");
    };

    const handleViewOrderHistory = () => {
        navigate("/app/orderhistory");
    };

    if (loading) {
        return (
            <>
                <NavigationBar />
                <div className="profile-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your profile...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavigationBar />
                <div className="profile-container">
                    <div className="error-container">
                        <div className="error-icon">❌</div>
                        <h2>Unable to load profile</h2>
                        <p>{error}</p>
                        <button className="btn-back" onClick={handleBackToHome}>
                            <span className="home-icon">🏠</span>
                            Back to Home
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <NavigationBar />
                <div className="profile-container">
                    <div className="error-container">
                        <div className="error-icon">👤</div>
                        <h2>User not found</h2>
                        <p>Unable to find user information</p>
                        <button className="btn-back" onClick={handleBackToHome}>
                            <span className="home-icon">🏠</span>
                            Back to Home
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavigationBar />
            <div className="profile-container">
                <div className="profile-header">
                    <button className="btn-back" onClick={handleBackToHome}>
                        <span className="back-icon">←</span>
                        Back to Store
                    </button>
                    <h2>
                        <span className="profile-icon">👤</span>
                        User Profile
                    </h2>
                    <div className="header-spacer"></div>
                </div>

                <div className="profile-content">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <div className="avatar-placeholder">
                                {user.firstName?.charAt(0)?.toUpperCase()}
                                {user.lastName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="avatar-status">
                                <span className="status-dot online"></span>
                                <span className="status-text">Online</span>
                            </div>
                        </div>

                        <div className="profile-info">
                            <div className="info-display">
                                <div className="info-row">
                                    <span className="info-label">
                                        <span className="info-icon">👤</span>
                                        First Name:
                                    </span>
                                    <span className="info-value">{user.firstName}</span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">
                                        <span className="info-icon">👤</span>
                                        Last Name:
                                    </span>
                                    <span className="info-value">{user.lastName}</span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">
                                        <span className="info-icon">📧</span>
                                        Email:
                                    </span>
                                    <span className="info-value">{user.email}</span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">
                                        <span className="info-icon">🔢</span>
                                        User ID:
                                    </span>
                                    <span className="info-value user-id">#{user.id}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <div className="view-actions">
                                <div className="secondary-actions">
                                    <button className="btn-secondary" onClick={handleViewCart}>
                                        <span className="btn-icon">🛒</span>
                                        View Cart
                                    </button>
                                    <button
                                        className="btn-secondary"
                                        onClick={handleViewOrderHistory}
                                    >
                                        <span className="btn-icon">📦</span>
                                        Order History
                                    </button>
                                </div>
                                <button className="btn-logout" onClick={handleLogout}>
                                    <span className="btn-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="profile-features">
                            <div className="feature">
                                <span className="feature-icon">🔐</span>
                                <span>Secure Account</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📱</span>
                                <span>Mobile Friendly</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🚀</span>
                                <span>Fast Updates</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;

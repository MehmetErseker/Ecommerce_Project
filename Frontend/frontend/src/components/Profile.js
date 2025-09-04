import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import "./Profile.css";

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                navigate("/app/login");
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
                    const userData = response.data.data;
                    setUser(userData);
                    setEditForm({
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        email: userData.email || ''
                    });
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

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form data when canceling edit
            setEditForm({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/app/login");
            return;
        }

        // Basic validation
        if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setSaving(true);

        try {
            const decoded = jwtDecode(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            const response = await axios.put(
                `https://localhost:44359/api/users/update/${userId}`,
                editForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setUser({ ...user, ...editForm });
                setIsEditing(false);
                toast.success("Profile updated successfully!");
            } else {
                toast.error("Failed to update profile: " + (response.data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Failed to update user:", error);
            toast.error("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

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
            <div className="profile-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
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
        );
    }

    if (!user) {
        return (
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
        );
    }

    return (
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
                            {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="avatar-status">
                            <span className="status-dot online"></span>
                            <span className="status-text">Online</span>
                        </div>
                    </div>

                    <div className="profile-info">
                        {isEditing ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label htmlFor="firstName">
                                        <span className="form-icon">👤</span>
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={editForm.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">
                                        <span className="form-icon">👤</span>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={editForm.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <span className="form-icon">📧</span>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>

                    <div className="profile-actions">
                        {isEditing ? (
                            <div className="edit-actions">
                                <button
                                    className={`btn-save ${saving ? 'loading' : ''}`}
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <span className="btn-icon">💾</span>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    className="btn-cancel"
                                    onClick={handleEditToggle}
                                    disabled={saving}
                                >
                                    <span className="btn-icon">❌</span>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="view-actions">
                                <button className="btn-edit" onClick={handleEditToggle}>
                                    <span className="btn-icon">✏️</span>
                                    Edit Profile
                                </button>
                                <div className="secondary-actions">
                                    <button className="btn-secondary" onClick={handleViewCart}>
                                        <span className="btn-icon">🛒</span>
                                        View Cart
                                    </button>
                                    <button className="btn-secondary" onClick={handleViewOrderHistory}>
                                        <span className="btn-icon">📦</span>
                                        Order History
                                    </button>
                                </div>
                                <button className="btn-logout" onClick={handleLogout}>
                                    <span className="btn-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        )}
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
    );
}

export default Profile;
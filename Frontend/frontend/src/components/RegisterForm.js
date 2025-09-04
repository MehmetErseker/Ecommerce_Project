import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "./RegisterForm.css";

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = "First name must be at least 2 characters";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = "Last name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }

        // Clear general message when user modifies form
        if (message) {
            setMessage("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post(
                "https://localhost:44359/api/auth/register",
                formData
            );

            setMessage(response.data);
            toast.success("Registration successful! You can now login.");

            // Reset form after successful registration
            setFormData({
                email: "",
                password: "",
                firstName: "",
                lastName: "",
            });

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                navigate("/app/login");
            }, 2000);

        } catch (error) {
            let errorMessage = "An error occurred during registration";

            if (error.response) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    const handleGoToLogin = () => {
        navigate("/app/login");
    };

    return (
        <div className="register-page">
            <div className="register-background">
                <div className="background-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>

            <div className="register-container">
                <div className="register-header">
                    <button className="back-btn" onClick={handleBackToHome}>
                        <span className="back-icon">←</span>
                        Back to Store
                    </button>
                </div>

                <div className="register-card">
                    <div className="register-form-container">
                        <div className="register-title">
                            <div className="title-icon">✨</div>
                            <h2>Create Account</h2>
                            <p className="subtitle">Join PentaStore and start shopping today</p>
                        </div>

                        <form onSubmit={handleSubmit} className="register-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName" className={errors.firstName ? 'error' : ''}>
                                        <span className="label-icon">👤</span>
                                        First Name
                                    </label>
                                    <div className="input-container">
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Enter first name"
                                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                                            disabled={loading}
                                        />
                                        <span className="input-icon">👤</span>
                                    </div>
                                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName" className={errors.lastName ? 'error' : ''}>
                                        <span className="label-icon">👤</span>
                                        Last Name
                                    </label>
                                    <div className="input-container">
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Enter last name"
                                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                                            disabled={loading}
                                        />
                                        <span className="input-icon">👤</span>
                                    </div>
                                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email" className={errors.email ? 'error' : ''}>
                                    <span className="label-icon">📧</span>
                                    Email Address
                                </label>
                                <div className="input-container">
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        className={`form-input ${errors.email ? 'error' : ''}`}
                                        disabled={loading}
                                    />
                                    <span className="input-icon">📧</span>
                                </div>
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="password" className={errors.password ? 'error' : ''}>
                                    <span className="label-icon">🔒</span>
                                    Password
                                </label>
                                <div className="input-container">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                                <div className="password-strength">
                                    <div className="strength-indicator">
                                        <div className="strength-bar">
                                            <div className={`strength-fill ${formData.password.length === 0 ? '' :
                                                    formData.password.length < 6 ? 'weak' :
                                                        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? 'medium' : 'strong'
                                                }`}></div>
                                        </div>
                                        <span className="strength-text">
                                            {formData.password.length === 0 ? '' :
                                                formData.password.length < 6 ? 'Weak' :
                                                    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? 'Medium' : 'Strong'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`register-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">🚀</span>
                                        Create Account
                                    </>
                                )}
                            </button>

                            {message && (
                                <div className={`register-message ${message.includes('successful') || message.includes('created') ? 'success' : 'error'}`}>
                                    <span className="message-icon">
                                        {message.includes('successful') || message.includes('created') ? '✅' : '❌'}
                                    </span>
                                    {message}
                                </div>
                            )}
                        </form>

                        <div className="register-footer">
                            <div className="divider">
                                <span>Already have an account?</span>
                            </div>
                            <button className="login-link-btn" onClick={handleGoToLogin}>
                                <span className="btn-icon">🔐</span>
                                Sign In Instead
                            </button>
                        </div>

                        <div className="register-features">
                            <div className="feature">
                                <span className="feature-icon">🔐</span>
                                <span>Secure Registration</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📱</span>
                                <span>Email Verification</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🚀</span>
                                <span>Instant Access</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import OTPForm from "./OTPForm";
import "./LoginForm.css";

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [ticketId, setTicketId] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }

        // Clear general message when user modifies form
        if (message) {
            setMessage("");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post(
                "https://localhost:44359/api/auth/login",
                formData
            );

            setTicketId(response.data.ticketId);
            setMessage("OTP has been sent to your email. Please enter it below.");
            toast.success("OTP sent successfully!");

        } catch (error) {
            let errorMessage = "An error occurred during login";

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

    const handleGoToRegister = () => {
        navigate("/app/register");
    };

    const handleLoginSuccess = () => {
        toast.success("Login successful! Welcome back!");
        navigate("/");
    };

    const handleBackToLogin = () => {
        setTicketId(null);
        setMessage("");
        setFormData({ email: "", password: "" });
        setErrors({});
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="background-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>

            <div className="login-container">
                <div className="login-header">
                    <button className="back-btn" onClick={handleBackToHome}>
                        <span className="back-icon">←</span>
                        Back to Store
                    </button>
                </div>

                <div className="login-card">
                    {!ticketId ? (
                        <div className="login-form-container">
                            <div className="login-title">
                                <div className="title-icon">🔐</div>
                                <h2>Welcome Back</h2>
                                <p className="subtitle">Sign in to your PentaStore account</p>
                            </div>

                            <form onSubmit={handleLogin} className="login-form">
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
                                            placeholder="Enter your password"
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
                                </div>

                                <button
                                    type="submit"
                                    className={`login-btn ${loading ? 'loading' : ''}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            <span className="btn-icon">🚀</span>
                                            Sign In
                                        </>
                                    )}
                                </button>

                                {message && (
                                    <div className={`login-message ${message.includes('OTP') ? 'success' : 'error'}`}>
                                        <span className="message-icon">
                                            {message.includes('OTP') ? '✅' : '❌'}
                                        </span>
                                        {message}
                                    </div>
                                )}
                            </form>

                            <div className="login-footer">
                                <div className="divider">
                                    <span>Don't have an account?</span>
                                </div>
                                <button className="register-link-btn" onClick={handleGoToRegister}>
                                    <span className="btn-icon">✨</span>
                                    Create New Account
                                </button>
                            </div>

                            <div className="login-features">
                                <div className="feature">
                                    <span className="feature-icon">🔐</span>
                                    <span>Secure Login</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">📱</span>
                                    <span>OTP Verification</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">🚀</span>
                                    <span>Quick Access</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="otp-container">
                            <div className="otp-header">
                                <button className="back-to-login-btn" onClick={handleBackToLogin}>
                                    <span className="back-icon">←</span>
                                    Back to Login
                                </button>
                                <div className="otp-title">
                                    <div className="title-icon">📱</div>
                                    <h2>Verify Your Account</h2>
                                    <p className="subtitle">Enter the OTP code sent to your email</p>
                                </div>
                            </div>

                            <OTPForm
                                ticketId={ticketId}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
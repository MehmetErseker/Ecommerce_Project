import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import "./OTPForm.css";

const OTPForm = ({ ticketId, onLoginSuccess }) => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Format time display
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle OTP input change
    const handleOTPChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only keep last digit
        setOtp(newOtp);

        // Clear message when user starts typing
        if (message) {
            setMessage("");
        }

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        const otpString = newOtp.join("");
        if (otpString.length === 6 && !loading) {
            handleOTPSubmit(null, otpString);
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Handle paste
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            inputRefs.current[5]?.focus();

            // Auto-submit pasted OTP
            setTimeout(() => {
                handleOTPSubmit(null, pastedData);
            }, 100);
        }
    };

    const handleOTPSubmit = async (e, otpString = null) => {
        if (e) e.preventDefault();

        const otpValue = otpString || otp.join("");

        if (otpValue.length !== 6) {
            setMessage("Please enter a complete 6-digit OTP");
            toast.error("Please enter a complete 6-digit OTP");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await axios.post(
                "https://localhost:44359/api/otp/verify",
                { TicketId: ticketId, Otp: otpValue },
                { headers: { "Content-Type": "application/json" } }
            );

            const token = response.data.token;

            if (token) {
                localStorage.setItem("jwtToken", token);
                setMessage("Login successful! Redirecting...");
                toast.success("OTP verified successfully!");

                // Call success callback with delay to show message
                if (onLoginSuccess) {
                    setTimeout(() => onLoginSuccess(), 1500);
                }
            } else {
                setMessage("Token could not be retrieved, please try again.");
                toast.error("Authentication failed");
            }
        } catch (error) {
            let errorMessage = "Verification failed. Please try again.";

            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || error.response.data || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessage(errorMessage);
            toast.error(errorMessage);

            // Clear OTP on error
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResending(true);
        setMessage("");

        try {
            // This would typically call a resend OTP endpoint
            await axios.post("https://localhost:44359/api/otp/resend", { TicketId: ticketId });

            setTimeLeft(300); // Reset timer
            setOtp(["", "", "", "", "", ""]); // Clear current OTP
            setMessage("New OTP has been sent to your email");
            toast.success("New OTP sent successfully!");
            inputRefs.current[0]?.focus();

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to resend OTP";
            setMessage(errorMessage);
            toast.error(errorMessage);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="otp-form-container">
            <div className="otp-header">
                <div className="otp-icon">📱</div>
                <h3>Enter Verification Code</h3>
                <p className="otp-description">
                    We've sent a 6-digit verification code to your email address.
                    Please enter it below to complete your login.
                </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="otp-form">
                <div className="otp-inputs">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOTPChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className={`otp-input ${digit ? 'filled' : ''} ${message.includes('failed') || message.includes('invalid') ? 'error' : ''}`}
                            disabled={loading}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                <div className="otp-timer">
                    {timeLeft > 0 ? (
                        <div className="timer-active">
                            <span className="timer-icon">⏱️</span>
                            <span>Code expires in {formatTime(timeLeft)}</span>
                        </div>
                    ) : (
                        <div className="timer-expired">
                            <span className="expired-icon">⚠️</span>
                            <span>Code has expired</span>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`verify-btn ${loading ? 'loading' : ''}`}
                    disabled={loading || otp.join("").length !== 6}
                >
                    {loading ? (
                        <>
                            <div className="btn-spinner"></div>
                            Verifying...
                        </>
                    ) : (
                        <>
                            <span className="btn-icon">✅</span>
                            Verify Code
                        </>
                    )}
                </button>

                {message && (
                    <div className={`otp-message ${message.includes('successful') || message.includes('sent') ? 'success' : 'error'
                        }`}>
                        <span className="message-icon">
                            {message.includes('successful') || message.includes('sent') ? '✅' : '❌'}
                        </span>
                        {message}
                    </div>
                )}
            </form>

            <div className="otp-footer">
                <div className="resend-section">
                    <p>Didn't receive the code?</p>
                    <button
                        type="button"
                        className={`resend-btn ${resending ? 'loading' : ''}`}
                        onClick={handleResendOTP}
                        disabled={resending || timeLeft > 240} // Can resend after 1 minute
                    >
                        {resending ? (
                            <>
                                <div className="btn-spinner small"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">📧</span>
                                Resend Code
                            </>
                        )}
                    </button>
                    {timeLeft > 240 && (
                        <small className="resend-timer">
                            You can request a new code in {formatTime(timeLeft - 240)}
                        </small>
                    )}
                </div>

                <div className="otp-help">
                    <div className="help-item">
                        <span className="help-icon">💡</span>
                        <span>Check your spam folder if you don't see the email</span>
                    </div>
                    <div className="help-item">
                        <span className="help-icon">⌨️</span>
                        <span>You can paste the complete 6-digit code</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPForm;
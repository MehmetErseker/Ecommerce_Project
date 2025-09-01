import React, { useState } from "react";
import axios from "axios";

const OTPForm = ({ ticketId, onLoginSuccess }) => {
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "https://localhost:44359/api/otp/verify", // Doğru endpoint
                { TicketId: ticketId, Otp: otp },        // DTO ile birebir eşleşme
                { headers: { "Content-Type": "application/json" } }
            );

            const token = response.data.token; // Backend’den gelen JWT token
            if (token) {
                localStorage.setItem("jwtToken", token); // Token'ı kaydet
                setMessage("Giriş başarılı! Yönlendiriliyorsunuz...");

                // Login başarılıysa callback ile yönlendir
                if (onLoginSuccess) {
                    setTimeout(() => onLoginSuccess(), 800); // kısa gecikme ile mesajı göster
                }
            } else {
                setMessage("Token alınamadı, lütfen tekrar deneyin.");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(error.response.data);
            } else {
                setMessage("Bir hata oluştu!");
            }
        }
    };

    return (
        <div className="otp-container">
            <h3>OTP Doğrulama</h3>
            <form onSubmit={handleOTPSubmit}>
                <div>
                    <label>OTP:</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Verify OTP</button>
            </form>
            {message && <p className="otp-message">{message}</p>}
        </div>
    );
};

export default OTPForm;

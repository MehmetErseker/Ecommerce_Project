import React, { useState } from "react";
import axios from "axios";
import OTPForm from "./OTPForm";
import "./LoginForm.css";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [ticketId, setTicketId] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // ✅ hook burada kullanılmalı

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "https://localhost:44359/api/auth/login",
                formData
            );
            setTicketId(response.data.ticketId); // backend'den ticketId alınıyor
            setMessage("OTP gönderildi, lütfen girin.");
        } catch (error) {
            if (error.response) setMessage(error.response.data);
            else setMessage("Bir hata oluştu!");
        }
    };

    return (
        <div className="login-container">
            {!ticketId ? (
                <>
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit">Login</button>
                    </form>
                    {message && <p className="login-message">{message}</p>}
                </>
            ) : (
                <OTPForm
                    ticketId={ticketId}
                    // ✅ OTP başarıyla doğrulanınca home'a yönlendir
                    onLoginSuccess={() => navigate("/")}
                />
            )}
        </div>
    );
};

export default LoginForm;

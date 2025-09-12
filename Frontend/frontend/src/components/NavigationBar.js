import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import RecordRTC from "recordrtc";
import "./NavigationBar.css";

const API_BASE = "https://localhost:44359";

export default function NavigationBar() {
    const navigate = useNavigate();

    // state
    const [categories, setCategories] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // voice search
    const [voiceRecording, setVoiceRecording] = useState(false);
    const recRef = useRef(null);
    const streamRef = useRef(null);
    const autoStopTimerRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/categories/getall`);
                if (response.data?.success) setCategories(response.data.data || []);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };

        const fetchUser = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;
            try {
                const decoded = jwtDecode(token);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
                const response = await axios.get(`${API_BASE}/api/users/getbyid/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data?.success) setUser(response.data.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };

        fetchCategories();
        fetchUser();

        return () => {
            try { if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current); } catch { }
            try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch { }
            try { recRef.current?.destroy?.(); } catch { }
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        setUser(null);
        navigate("/");
    };

    const handleSearch = () => {
        const q = (searchTerm || "").trim();
        if (!q) return;
        navigate(`/app/search?q=${encodeURIComponent(q)}`);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    // ----- Voice search helpers -----
    const extractSpokenQuery = (rawText, slots) => {
        const productFromSlot = slots && (slots.product || slots.query || slots.name);
        if (typeof productFromSlot === "string" && productFromSlot.trim().length > 0) {
            return productFromSlot.trim();
        }

        if (!rawText) return null;
        let t = rawText.toLowerCase().replace(/[.,!?]/g, " ").replace(/\s+/g, " ").trim();

        let m = t.match(/\b(?:ara|bul|araştır)\s+(.+)/i);
        if (m && m[1]) return m[1].trim();

        m = t.match(/^(.+?)\s+(?:ara|bul|araştır)\b/i);
        if (m && m[1]) return m[1].trim();

        m = t.match(/^(.+?)\s+fiyat(ı|ini)?\b/i);
        if (m && m[1]) return m[1].trim();

        const stop = new Set(["ara", "bul", "araştır", "fiyat", "fiyatı", "fiyatini", "sepete", "ekle", "adet", "tane"]);
        const cleaned = t.split(" ").filter(w => w && !stop.has(w)).join(" ").trim();
        return cleaned.length >= 2 ? cleaned : null;
    };

    const startVoiceSearch = async () => {
        try {
            if (voiceRecording) return;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const rec = new RecordRTC(stream, {
                type: "audio",
                mimeType: "audio/wav",
                recorderType: RecordRTC.StereoAudioRecorder,
                desiredSampRate: 16000,
            });
            rec.startRecording();
            recRef.current = rec;
            setVoiceRecording(true);

            autoStopTimerRef.current = setTimeout(() => {
                stopVoiceSearch("auto").catch(() => { });
            }, 3300);
        } catch (e) {
            console.error(e);
            toast.error("Mikrofon izni gerekli veya kayıt başlatılamadı.");
        }
    };

    const stopVoiceSearch = async () => {
        try {
            if (autoStopTimerRef.current) {
                clearTimeout(autoStopTimerRef.current);
                autoStopTimerRef.current = null;
            }
            const rec = recRef.current;
            if (!rec) return;

            const blob = await new Promise((resolve) => {
                try {
                    rec.stopRecording(() => {
                        try { resolve(rec.getBlob()); } catch { resolve(null); }
                    });
                } catch { resolve(null); }
            });

            try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch { }
            try { rec.destroy(); } catch { }
            recRef.current = null;
            streamRef.current = null;

            if (!(blob instanceof Blob)) {
                toast.error("Ses kaydı alınamadı, tekrar dener misin?");
                setVoiceRecording(false);
                return;
            }

            const file = new File([blob], "input.wav", { type: blob.type || "audio/wav" });
            const form = new FormData();
            form.append("Audio", file);

            const resp = await axios.post(`${API_BASE}/api/voice/interpret`, form);
            const data = resp.data || {};
            const transcript = (data.transcript || "").toLowerCase();

            const q = extractSpokenQuery(transcript, data.slots || {});
            if (q && q.trim()) {
                setSearchTerm(q);
                navigate(`/app/search?q=${encodeURIComponent(q)}`);
                toast.success(`Arandı: ${q}`);
            } else {
                toast.info(
                    `Komut anlaşılamadı${data.transcript ? `: "${data.transcript}"` : ""}. ` +
                    `Örn: "iphone 15 ara", "kulaklık bul"`
                );
            }
        } catch (err) {
            console.error(err);
            toast.error("Sesli arama sırasında bir hata oluştu.");
        } finally {
            setVoiceRecording(false);
        }
    };

    return (
        <nav className="navbar">
            <div className="logo" onClick={() => navigate("/")}>
                <span className="logo-icon">🏪</span>
                PentaStore
            </div>

            <div className="nav-search">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search"
                    className="nav-search-input"
                    aria-label="Search products"
                />
                <button className="nav-search-btn" onClick={handleSearch}>🔎</button>
                <button
                    className={`nav-search-btn mic ${voiceRecording ? "recording" : ""}`}
                    onClick={voiceRecording ? stopVoiceSearch : startVoiceSearch}
                    title="Voice Search"
                >
                    {voiceRecording ? "⏹" : "🎙"}
                </button>
            </div>

            <div className="nav-links">
                <div className="dropdown">
                    <button
                        className="dropdown-btn"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span className="nav-icon">📂</span>
                        Categories
                        <span className="dropdown-arrow">▾</span>
                    </button>
                    {showDropdown && (
                        <ul className="dropdown-menu">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <li
                                        key={cat.id}
                                        className="dropdown-item"
                                        onClick={() => {
                                            setShowDropdown(false);
                                            navigate(`/app/category/${cat.id}`);
                                        }}
                                    >
                                        {cat.name}
                                    </li>
                                ))
                            ) : (
                                <li className="dropdown-item">No categories</li>
                            )}
                        </ul>
                    )}
                </div>

                {user ? (
                    <div className="user-section">
                        <button className="nav-btn" onClick={() => navigate("/app/cart")}>
                            <span className="nav-icon">🛒</span>
                            Cart
                        </button>
                        <button className="nav-btn" onClick={() => navigate("/app/orderhistory")}>
                            <span className="nav-icon">📦</span>
                            Order History
                        </button>
                        <button className="nav-btn profile-btn" onClick={() => navigate("/app/profile")}>
                            <span className="nav-icon">👤</span>
                            {user.firstName} {user.lastName}
                        </button>
                        <button className="nav-btn logout-btn" onClick={handleLogout}>
                            <span className="nav-icon">🚪</span>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="auth-section">
                        <button className="nav-btn login-btn" onClick={() => navigate("/app/login")}>
                            <span className="nav-icon">🔑</span>
                            Login
                        </button>
                        <button className="nav-btn register-btn" onClick={() => navigate("/app/register")}>
                            <span className="nav-icon">✨</span>
                            Register
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import "./Home.css";
import RecordRTC from "recordrtc";

function Home() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // 🔗 API kökü (statik resimler de bu domain/porttan servis ediliyor)
    const API_BASE = "https://localhost:44359";

    // 🔧 Yardımcı: imageUrl absolute değilse API_BASE ile birleştir
    const resolveImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
        // leading slash yoksa ekleyelim
        return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    };

    // 🎙 Voice Search state/refs
    const [voiceRecording, setVoiceRecording] = useState(false);
    const recRef = useRef(null);
    const streamRef = useRef(null);
    const autoStopTimerRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://localhost:44359/api/categories/getall");
                if (response.data.success) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await axios.get("https://localhost:44359/api/products/getall");
                if (response.data.success) {
                    setProducts(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        const fetchUser = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                const response = await axios.get(
                    `https://localhost:44359/api/users/getbyid/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setUser(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchCategories();
        fetchProducts();
        fetchUser();

        // cleanup (component unmount)
        return () => {
            try { if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current); } catch { }
            try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch { }
            try { recRef.current?.destroy?.(); } catch { }
        };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [products]);

    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        setUser(null);
        navigate("/");
    };

    const handleAddToCart = async (productId, e) => {
        e.stopPropagation(); // ürün kartı tıklamasını engelle
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/app/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            const cartResponse = await axios.get(
                `https://localhost:44359/api/carts/getbyid/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!cartResponse.data.success || !cartResponse.data.data) {
                alert("Cart not found for this user!");
                return;
            }

            const cartId = cartResponse.data.data.id;

            const response = await axios.post(
                `https://localhost:44359/api/carts/addtocart?cartId=${cartId}&productId=${productId}&quantity=1`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Product added to cart!");
            } else {
                toast.error("Failed to add product to cart.");
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error("Something went wrong while adding to cart.")
        }
    };

    const handleSearch = () => {
        const q = searchTerm.trim();
        if (!q) return;
        navigate(`/app/search?q=${encodeURIComponent(q)}`);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // ---- Voice Search helpers ----
    const extractSpokenQuery = (rawText, slots) => {
        // 1) Python servisinden "search" intent + "product" slot geldiyse onu kullan
        const productFromSlot = slots && (slots.product || slots.query || slots.name);
        if (typeof productFromSlot === "string" && productFromSlot.trim().length > 0) {
            return productFromSlot.trim();
        }

        // 2) Transcript heuristics
        if (!rawText) return null;
        let t = rawText.toLowerCase().replace(/[.,!?]/g, " ").replace(/\s+/g, " ").trim();

        // "ara|bul|araştır <ürün>"
        let m = t.match(/\b(?:ara|bul|araştır)\s+(.+)/i);
        if (m && m[1]) return m[1].trim();

        // "<ürün> ara|bul|araştır"
        m = t.match(/^(.+?)\s+(?:ara|bul|araştır)\b/i);
        if (m && m[1]) return m[1].trim();

        // "<ürün> fiyatı" gibi ifadelerde de ürün adını alalım (arama sayfasına yönlendirmek için faydalı)
        m = t.match(/^(.+?)\s+fiyat(ı|ini)?\b/i);
        if (m && m[1]) return m[1].trim();

        // stopword temizliği (temel)
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
                desiredSampRate: 16000
            });
            rec.startRecording();
            recRef.current = rec;
            setVoiceRecording(true);

            // 3.3 sn sonra otomatik durdur
            autoStopTimerRef.current = setTimeout(() => {
                stopVoiceSearch("auto").catch(() => { });
            }, 3300);
        } catch (e) {
            console.error(e);
            toast.error("Mikrofon izni gerekli veya kayıt başlatılamadı.");
        }
    };

    const stopVoiceSearch = async (reason = "manual") => {
        try {
            if (autoStopTimerRef.current) {
                clearTimeout(autoStopTimerRef.current);
                autoStopTimerRef.current = null;
            }
            const rec = recRef.current;
            if (!rec) return;

            // stopRecording'i Promise ile bekle
            const blob = await new Promise((resolve) => {
                try {
                    rec.stopRecording(() => {
                        try { resolve(rec.getBlob()); } catch { resolve(null); }
                    });
                } catch { resolve(null); }
            });

            // kaynakları kapat
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
            form.append("Audio", file); // backend DTO'da "Audio"; (case-insensitive)

            // Python VoiceService → /api/voice/interpret (proxy)
            const resp = await axios.post("https://localhost:44359/api/voice/interpret", form);
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

    const totalItems = products.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const visibleProducts = products.slice(startIndex, endIndex);

    const goToPage = (p) => {
        const page = Math.min(Math.max(p, 1), totalPages);
        setCurrentPage(page);
    };

    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    return (
        <div className="home-container">
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
                    <button className="nav-search-btn" onClick={handleSearch}>
                        🔎
                    </button>
                    {/* 🎙 Voice search button */}
                    <button
                        className="nav-search-btn"
                        onClick={voiceRecording ? () => stopVoiceSearch("manual") : startVoiceSearch}
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
                                            onClick={() =>
                                                navigate(`/app/category/${cat.id}`)
                                            }
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

            {!user && (
                <div className="hero-section">
                    <div className="hero-content">
                        <h1>Welcome to PentaStore</h1>
                        <p className="hero-subtitle">
                            Your premier destination for quality products with secure authentication
                        </p>
                        <div className="hero-features">
                            <div className="feature">
                                <span className="feature-icon">🔐</span>
                                <span>Secure Authentication</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">📱</span>
                                <span>OTP Verification</span>
                            </div>
                            <div className="feature">
                                <span className="feature-icon">🚀</span>
                                <span>Fast & Reliable</span>
                            </div>
                        </div>
                        <div className="hero-buttons">
                            <button
                                className="btn-primary"
                                onClick={() => navigate("/app/register")}
                            >
                                Get Started
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => navigate("/app/login")}
                            >
                                Already have an account? Login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="products-section">
                <div className="products-header">
                    <h2>Featured Products</h2>
                    <p>Discover our carefully curated collection of premium products</p>
                </div>
                <div className="products-grid">
                    {visibleProducts.length > 0 ? (
                        visibleProducts.map((prod) => {
                            const imgSrc = resolveImageUrl(prod.imageUrl); // ← ImageUrl kullan
                            return (
                                <div
                                    key={prod.id}
                                    className="product-card"
                                    onClick={() => navigate(`/app/product/${prod.id}`)}
                                >
                                    <div className="product-image">
                                        {imgSrc ? (
                                            <img
                                                src={imgSrc}
                                                alt={prod.name}
                                                className="product-img"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="product-placeholder">📦</div>
                                        )}
                                    </div>
                                    <div className="product-info">
                                        <h3>{prod.name}</h3>
                                        <div className="product-price">
                                            <span className="price">{prod.unitPrice}TL</span>
                                        </div>
                                        <div className="product-stock">
                                            <span className="stock-label">Stock:</span>
                                            <span className={`stock-value ${prod.unitsInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                {prod.unitsInStock}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="product-actions">
                                        <button
                                            className="add-to-cart-btn"
                                            onClick={(e) => handleAddToCart(prod.id, e)}
                                            disabled={prod.unitsInStock <= 0}
                                        >
                                            <span className="btn-icon">🛒</span>
                                            Add to Cart
                                        </button>
                                        <button
                                            className="details-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/app/product/${prod.id}`);
                                            }}
                                        >
                                            <span className="btn-icon">👁️</span>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-products">
                            <div className="no-products-icon">📋</div>
                            <p>No products available at the moment</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination" style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
                        <button
                            className="pager-btn"
                            onClick={prevPage}
                            disabled={currentPage <= 1}
                        >
                            ‹ Prev
                        </button>
                        <span className="pager-info">
                            Page {safePage} / {totalPages}
                        </span>
                        <button
                            className="pager-btn"
                            onClick={nextPage}
                            disabled={currentPage >= totalPages}
                        >
                            Next ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;

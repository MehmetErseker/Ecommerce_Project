import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import "./ProductPage.css";
import RecordRTC from "recordrtc";
import NavigationBar from "./NavigationBar"; // ✅ Ortak navigation bar

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

    // Voice state
    const [voiceRec, setVoiceRec] = useState(null);
    const [voiceRecording, setVoiceRecording] = useState(false);
    const recRef = useRef(null);
    const streamRef = useRef(null);
    const autoStopTimerRef = useRef(null);

    // Seçili quantity (voice ile de güncellenebilir)
    const [qty, setQty] = useState(1);

    // 🔗 Home.js ile aynı: API kökü ve resim URL birleştirici
    const API_BASE = "https://localhost:44359";
    const resolveImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
        return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `https://localhost:44359/api/products/getbyid/${productId}`
                );
                if (response.data.success) {
                    const data = response.data.data;
                    const normalizedProduct = {
                        id: data.id ?? data.Id,
                        name: data.name ?? data.Name,
                        categoryId: data.categoryId ?? data.CategoryId,
                        unitPrice: data.unitPrice ?? data.UnitPrice,
                        unitsInStock: data.unitsInStock ?? data.UnitsInStock,
                        imageUrl: data.imageUrl ?? data.ImageUrl, // ✅ resim alanı eklendi
                    };
                    setProduct(normalizedProduct);

                    if (normalizedProduct.categoryId) {
                        try {
                            const categoryResponse = await axios.get(
                                `https://localhost:44359/api/categories/getbyid/${normalizedProduct.categoryId}`
                            );
                            if (categoryResponse.data.success) {
                                setCategory(categoryResponse.data.data);
                            }
                        } catch (categoryError) {
                            console.error("Failed to fetch category:", categoryError);
                        }
                    }
                } else {
                    setError("Product not found");
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                setError("Failed to load product");
            } finally {
                setLoading(false);
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

        fetchProduct();
        fetchUser();

        // cleanup on unmount
        return () => {
            try { if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current); } catch { }
            try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch { }
            try { recRef.current?.destroy?.(); } catch { }
        };
    }, [productId]);

    // --- Quantity parser (tolerant) ---
    const extractQuantity = (rawText) => {
        if (!rawText) return null;
        const t = rawText
            .toLowerCase()
            .replace(/[.,!?]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // 1) digits: son görülen sayıyı al (örn. "2 adet", "al 3 tane")
        const nums = [...t.matchAll(/\b(\d{1,3})\b/g)].map(m => parseInt(m[1], 10)).filter(n => !isNaN(n) && n > 0);
        if (nums.length) return nums[nums.length - 1];

        // 2) words 1..10
        const words = {
            "bir": 1, "iki": 2, "üç": 3, "uc": 3, "dört": 4, "dort": 4, "beş": 5, "bes": 5,
            "altı": 6, "alti": 6, "yedi": 7, "sekiz": 8, "dokuz": 9, "on": 10
        };
        for (const [w, n] of Object.entries(words)) {
            if (new RegExp(`\\b${w}\\b`, "i").test(t)) return n;
        }
        return null;
    };

    const startVoice = async () => {
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
            setVoiceRec(rec);
            setVoiceRecording(true);
            recRef.current = rec;

            // 3.3s sonra otomatik stop (son hece kesilmesin)
            autoStopTimerRef.current = setTimeout(() => {
                stopVoice("auto").catch(() => { });
            }, 3300);
        } catch (e) {
            console.error(e);
            toast.error("Mikrofon izni gerekli veya kayıt başlatılamadı.");
        }
    };

    const stopVoice = async (reason = "manual") => {
        try {
            if (autoStopTimerRef.current) {
                clearTimeout(autoStopTimerRef.current);
                autoStopTimerRef.current = null;
            }

            const rec = recRef.current || voiceRec;
            if (!rec) return;

            // stopRecording'i Promise ile bekle → Blob hazır
            const getBlobAfterStop = () =>
                new Promise((resolve) => {
                    try {
                        rec.stopRecording(() => {
                            try { resolve(rec.getBlob()); } catch { resolve(null); }
                        });
                    } catch { resolve(null); }
                });

            const blob = await getBlobAfterStop();

            // kaynakları kapat
            try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch { }
            try { rec.destroy(); } catch { }
            recRef.current = null;
            streamRef.current = null;

            if (!(blob instanceof Blob)) {
                toast.error("Please try again.");
                setVoiceRecording(false);
                setVoiceRec(null);
                return;
            }

            // Blob'u File olarak ekle
            const file = new File([blob], "input.wav", { type: blob.type || "audio/wav" });
            const form = new FormData();
            form.append("Audio", file); // DTO kullandıysan 'Audio', aksi halde 'audio' da çalışır

            try {
                const res = await axios.post(
                    "https://localhost:44359/api/voice/interpret",
                    form // Content-Type'ı tarayıcı ayarlasın
                );
                const data = res.data;

                const transcript = (data?.transcript || "")
                    .toLowerCase()
                    .replace(/[.,!?]/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

                // adet yakala (2, 3, iki, üç, ...)
                const qDetected = extractQuantity(transcript) ?? 1;

                // "sepete" + "ek*" veya intent = add_to_cart → direkt ekle
                const looksLikeAdd =
                    data?.intent === "add_to_cart" ||
                    /\bsepete\b/.test(transcript) ||
                    /\bek\w*\b/.test(transcript) || // ek, ekle, ekler...
                    /\bat\w*\b/.test(transcript) ||  // at/atın/attın (opsiyonel)
                    /\bkoy\w*\b/.test(transcript);   // koy/koyun (opsiyonel)

                // Sadece "2 adet", "üç tane" gibi miktar söylerse de otomatik ekle
                const quantityOnly =
                    qDetected &&
                    (
                        /^\d+\s*(adet|tane)?$/.test(transcript) ||
                        /^(bir|iki|üç|uc|dört|dort|beş|bes|altı|alti|yedi|sekiz|dokuz|on)\s*(adet|tane)?$/.test(transcript)
                    );

                // state'e yaz (UI'da Add to Cart (xN) gösterir)
                setQty(qDetected);

                if (looksLikeAdd || quantityOnly) {
                    await handleAddToCart(qDetected);
                    toast.success(`Sesli komut: x${qDetected} sepete eklendi.`);
                } else {
                    toast.info(
                        `Adet ${qDetected} olarak ayarlandı${data?.transcript ? ` ("${data.transcript}")` : ""}. `
                        + `İstersen "sepete ekle" de diyebilirsin.`
                    );
                }
            } catch (err) {
                console.error(err);
                toast.error("Sesli komut gönderilirken bir hata oluştu.");
            } finally {
                setVoiceRecording(false);
                setVoiceRec(null);
            }
        } catch (e) {
            console.error(e);
            setVoiceRecording(false);
            setVoiceRec(null);
            try { streamRef.current?.getTracks()?.forEach(t => t.stop()); } catch { }
        }
    };

    // Add to Cart handler (adet parametreli)
    const handleAddToCart = async (quantityArg) => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/app/login");
            return;
        }

        if (product.unitsInStock <= 0) {
            toast.error("This product is out of stock");
            return;
        }

        const quantity = Math.max(1, Number.isFinite(quantityArg) ? quantityArg : (qty || 1));

        setAddingToCart(true);

        try {
            const decoded = jwtDecode(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            // Kullanıcının sepeti
            const cartResponse = await axios.get(
                `https://localhost:44359/api/carts/getbyid/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!cartResponse.data.success || !cartResponse.data.data) {
                toast.error("Cart not found for this user!");
                return;
            }

            const cartId = cartResponse.data.data.id;

            // Sepete ekle (adet ile)
            const response = await axios.post(
                `https://localhost:44359/api/carts/addtocart?cartId=${cartId}&productId=${product.id}&quantity=${quantity}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success(`Product added to cart (x${quantity})!`);
            } else {
                toast.error("Failed to add product: " + response.data.message);
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error("Something went wrong while adding to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    const handleViewCategory = () => {
        if (product.categoryId) {
            navigate(`/app/category/${product.categoryId}`);
        }
    };

    const handleGoToCart = () => {
        navigate("/app/cart");
    };

    if (loading) {
        return (
            <>
                <NavigationBar />
                <div className="product-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading product details...</p>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavigationBar />
                <div className="product-container">
                    <div className="error-container">
                        <div className="error-icon">❌</div>
                        <h2>Unable to load product</h2>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button className="btn-back" onClick={handleGoBack}>
                                <span className="back-icon">←</span>
                                Go Back
                            </button>
                            <button className="btn-home" onClick={handleBackToHome}>
                                <span className="home-icon">🏠</span>
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <NavigationBar />
                <div className="product-container">
                    <div className="error-container">
                        <div className="error-icon">📦</div>
                        <h2>Product not found</h2>
                        <p>The product you're looking for doesn't exist.</p>
                        <div className="error-actions">
                            <button className="btn-back" onClick={handleGoBack}>
                                <span className="back-icon">←</span>
                                Go Back
                            </button>
                            <button className="btn-home" onClick={handleBackToHome}>
                                <span className="home-icon">🏠</span>
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* ✅ Ortak Navigation */}
            <NavigationBar />

            <div className="product-container">
                <div className="product-header">
                    <button className="btn-back" onClick={handleGoBack}>
                        <span className="back-icon">←</span>
                        Go Back
                    </button>
                    <div className="breadcrumb">
                        <button className="breadcrumb-link" onClick={handleBackToHome}>
                            Home
                        </button>
                        <span className="breadcrumb-separator">/</span>
                        {category && (
                            <>
                                <button className="breadcrumb-link" onClick={handleViewCategory}>
                                    {category.name}
                                </button>
                                <span className="breadcrumb-separator">/</span>
                            </>
                        )}
                        <span className="breadcrumb-current">{product.name}</span>
                    </div>
                    <div className="header-spacer"></div>
                </div>

                <div className="product-content">
                    <div className="product-image-section">
                        <div className="product-image">
                            {product.imageUrl ? (
                                <img
                                    src={resolveImageUrl(product.imageUrl)}
                                    alt={product.name}
                                    className="product-img"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="product-placeholder">📦</div>
                            )}
                            {product.unitsInStock <= 0 && (
                                <div className="out-of-stock-overlay">
                                    <span>Out of Stock</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="product-details-section">
                        <div className="product-card-detail">
                            <div className="product-title">
                                <h1>{product.name}</h1>
                                <div className={`availability ${product.unitsInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.unitsInStock > 0 ? '✅ In Stock' : '❌ Out of Stock'}
                                </div>
                            </div>

                            <div className="product-info">
                                <div className="info-row">
                                    <span className="info-label">
                                        <span className="info-icon">💰</span>
                                        Price:
                                    </span>
                                    <span className="info-value price">
                                        {product.unitPrice} TL
                                    </span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">
                                        <span className="info-icon">📦</span>
                                        Stock:
                                    </span>
                                    <span className={`info-value stock ${product.unitsInStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.unitsInStock} units
                                    </span>
                                </div>

                                {category && (
                                    <div className="info-row">
                                        <span className="info-label">
                                            <span className="info-icon">📂</span>
                                            Category:
                                        </span>
                                        <button
                                            className="info-value category-link"
                                            onClick={handleViewCategory}
                                        >
                                            {category.name}
                                        </button>
                                    </div>
                                )}

                                <div className="info-row">
                                    <span className="info-label">
                                        <span className="info-icon">🔢</span>
                                        Product ID:
                                    </span>
                                    <span className="info-value product-id">
                                        #{product.id}
                                    </span>
                                </div>
                            </div>

                            <div className="product-actions">
                                <button
                                    className={`btn-add-to-cart ${product.unitsInStock <= 0 ? 'disabled' : ''} ${addingToCart ? 'loading' : ''}`}
                                    onClick={() => handleAddToCart()}
                                    disabled={product.unitsInStock <= 0 || addingToCart}
                                >
                                    {addingToCart ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            Adding...
                                        </>
                                    ) : product.unitsInStock <= 0 ? (
                                        <>
                                            <span className="btn-icon">❌</span>
                                            Out of Stock
                                        </>
                                    ) : (
                                        <>
                                            <span className="btn-icon">🛒</span>
                                            Add to Cart{qty > 1 ? ` (x${qty})` : ""}
                                        </>
                                    )}
                                </button>

                                <button
                                    className="btn-add-to-cart"
                                    onClick={voiceRecording ? () => stopVoice("manual") : startVoice}
                                    disabled={addingToCart}
                                >
                                    {voiceRecording ? "⏹ Komutu Gönder" : "🎙 Adeti Sesle Seç / Ekle"}
                                </button>

                                {user && (
                                    <button className="btn-view-cart" onClick={handleGoToCart}>
                                        <span className="btn-icon">👁️</span>
                                        View Cart
                                    </button>
                                )}
                            </div>

                            <div className="product-features">
                                <div className="feature">
                                    <span className="feature-icon">🚚</span>
                                    <span>Free Shipping</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">🔄</span>
                                    <span>Easy Returns</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">🔒</span>
                                    <span>Secure Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ProductPage;

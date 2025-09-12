import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "./Home.css";
import NavigationBar from "./NavigationBar"; // ✅ yeni component

function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // 🔗 API kökü (statik resimler de bu domain/porttan servis ediliyor)
    const API_BASE = "https://localhost:44359";

    // 🔧 Yardımcı: imageUrl absolute değilse API_BASE ile birleştir
    const resolveImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
        return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/products/getall`);
                if (response.data.success) setProducts(response.data.data);
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
                const response = await axios.get(`${API_BASE}/api/users/getbyid/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.success) setUser(response.data.data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };

        fetchProducts();
        fetchUser();
    }, []);

    useEffect(() => { setCurrentPage(1); }, [products]);

    const handleAddToCart = async (productId, e) => {
        e.stopPropagation();
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/app/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            const cartResponse = await axios.get(`${API_BASE}/api/carts/getbyid/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!cartResponse.data.success || !cartResponse.data.data) {
                alert("Cart not found for this user!");
                return;
            }

            const cartId = cartResponse.data.data.id;

            const response = await axios.post(
                `${API_BASE}/api/carts/addtocart?cartId=${cartId}&productId=${productId}&quantity=1`,
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
            toast.error("Something went wrong while adding to cart.");
        }
    };

    const totalItems = products.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const visibleProducts = products.slice(startIndex, endIndex);

    const goToPage = (p) => setCurrentPage(Math.min(Math.max(p, 1), totalPages));
    const nextPage = () => goToPage(currentPage + 1);
    const prevPage = () => goToPage(currentPage - 1);

    return (
        <div className="home-container">
            {/* ✅ Artık ortak NavigationBar */}
            <NavigationBar />

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
                            <button className="btn-primary" onClick={() => navigate("/app/register")}>
                                Get Started
                            </button>
                            <button className="btn-secondary" onClick={() => navigate("/app/login")}>
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
                            const imgSrc = resolveImageUrl(prod.imageUrl);
                            return (
                                <div
                                    key={prod.id}
                                    className="product-card"
                                    onClick={() => navigate(`/app/product/${prod.id}`)}
                                >
                                    <div className="product-image">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={prod.name} className="product-img" loading="lazy" />
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
                                            <span className={`stock-value ${prod.unitsInStock > 0 ? "in-stock" : "out-of-stock"}`}>
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
                    <div
                        className="pagination"
                        style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}
                    >
                        <button className="pager-btn" onClick={prevPage} disabled={currentPage <= 1}>
                            ‹ Prev
                        </button>
                        <span className="pager-info">Page {safePage} / {totalPages}</span>
                        <button className="pager-btn" onClick={nextPage} disabled={currentPage >= totalPages}>
                            Next ›
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;

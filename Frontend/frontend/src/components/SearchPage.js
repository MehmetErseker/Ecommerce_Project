import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import "./SearchPage.css";
import NavigationBar from "./NavigationBar"; // ✅ Ortak navbar

function useQuery() {
    const { search } = useLocation();
    return new URLSearchParams(search);
}

const SearchPage = () => {
    const navigate = useNavigate();
    const query = useQuery();
    const qParam = query.get("q") || "";

    const [q, setQ] = useState(qParam);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [user, setUser] = useState(null);

    // 🔗 Home.js / CategoryPage.js ile aynı base ve yardımcı
    const API_BASE = "https://localhost:44359";
    const resolveImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
        return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    };

    useEffect(() => {
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

        fetchUser();
    }, []);

    // Add to Cart functionality
    const handleAddToCart = async (productId, e) => {
        e.stopPropagation(); // kart tıklamasını engelle
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
                toast.error("Cart not found for this user!");
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
            toast.error("Something went wrong while adding to cart.");
        }
    };

    const performSearch = async (text) => {
        const term = (text ?? "").trim();
        if (!term) {
            setResults([]);
            setSearchPerformed(false);
            return;
        }

        try {
            setLoading(true);
            setSearchPerformed(true);

            // Backend: /api/products/getbyname/{productName}
            const url = `https://localhost:44359/api/products/getbyname/${encodeURIComponent(term)}`;
            const resp = await axios.get(url);

            if (resp.data && resp.data.success) {
                setResults(resp.data.data || []);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error("Search failed:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Initial search on page load
    useEffect(() => {
        setQ(qParam);
        if (qParam) {
            performSearch(qParam);
        }
    }, [qParam]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const term = q.trim();
        if (!term) return;
        navigate(`/app/search?q=${encodeURIComponent(term)}`);
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    const handleClearSearch = () => {
        setQ("");
        setResults([]);
        setSearchPerformed(false);
        navigate("/app/search");
    };

    return (
        <>
            {/* ✅ Ortak Navigation */}
            <NavigationBar />

            <div className="search-page">
                <div className="search-header">
                    <button className="back-btn" onClick={handleBackToHome}>
                        <span className="back-icon">←</span>
                        Back to Store
                    </button>
                    <div className="search-title">
                        <h1>
                            <span className="search-icon">🔍</span>
                            Product Search
                        </h1>
                        <p className="search-subtitle">Find exactly what you're looking for</p>
                    </div>
                    <div className="header-spacer"></div>
                </div>

                <div className="search-container">
                    <div className="search-bar-wrap">
                        <form onSubmit={handleSubmit} className="search-form">
                            <div className="search-input-container">
                                <input
                                    className="search-input"
                                    type="text"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search products (e.g. iPhone, Samsung, laptop)..."
                                    aria-label="Search products"
                                />
                                <span className="search-input-icon">🔍</span>
                                {q && (
                                    <button
                                        type="button"
                                        className="clear-search-btn"
                                        onClick={handleClearSearch}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            <button className="search-btn" type="submit" disabled={!q.trim()}>
                                <span className="btn-icon">🔍</span>
                                Search
                            </button>
                        </form>

                        {loading && (
                            <div className="search-loading">
                                <div className="loading-spinner"></div>
                                <span>Searching...</span>
                            </div>
                        )}
                    </div>

                    <div className="search-results">
                        <div className="results-header">
                            <div className="results-info">
                                {searchPerformed && (
                                    <>
                                        <h2>Search Results</h2>
                                        <div className="results-meta">
                                            <span className="search-query">
                                                Search: "{qParam}"
                                            </span>
                                            <span className="results-count">
                                                {results.length} {results.length === 1 ? 'result' : 'results'} found
                                            </span>
                                        </div>
                                    </>
                                )}
                                {!searchPerformed && !qParam && (
                                    <>
                                        <h2>Search Products</h2>
                                        <p className="search-instruction">Enter a product name or keyword to find what you're looking for</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {!searchPerformed && !qParam ? (
                            <div className="search-suggestions">
                                <div className="suggestions-content">
                                    <div className="suggestion-icon">💡</div>
                                    <h3>Search Tips</h3>
                                    <ul className="tips-list">
                                        <li>Try specific product names like "iPhone" or "Samsung"</li>
                                        <li>Use model numbers for exact matches</li>
                                        <li>Search by brand, category, or features</li>
                                        <li>Keep it simple - shorter searches often work better</li>
                                    </ul>
                                </div>
                            </div>
                        ) : results.length === 0 && !loading && searchPerformed ? (
                            <div className="no-results">
                                <div className="no-results-icon">🔍</div>
                                <h3>No Results Found</h3>
                                <p>We couldn't find any products matching "{qParam}"</p>
                                <div className="no-results-suggestions">
                                    <h4>Try:</h4>
                                    <ul>
                                        <li>Checking your spelling</li>
                                        <li>Using different keywords</li>
                                        <li>Being more general in your search</li>
                                        <li>Browsing our categories instead</li>
                                    </ul>
                                </div>
                                <button className="browse-categories-btn" onClick={handleBackToHome}>
                                    <span className="btn-icon">📂</span>
                                    Browse Categories
                                </button>
                            </div>
                        ) : (
                            <div className="results-grid">
                                {results.map((prod) => {
                                    const imgSrc = resolveImageUrl(prod.imageUrl || prod.ImageUrl); // ✅ Home/Category ile aynı
                                    return (
                                        <div
                                            key={prod.id}
                                            className="result-card"
                                            onClick={() => navigate(`/app/product/${prod.id}`)}
                                        >
                                            <div className="result-image">
                                                {imgSrc ? (
                                                    <img
                                                        src={imgSrc}
                                                        alt={prod.name}
                                                        className="result-img"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="result-placeholder">📦</div>
                                                )}
                                                {prod.unitsInStock <= 0 && (
                                                    <div className="out-of-stock-overlay">
                                                        <span>Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="result-info">
                                                <h3 className="product-name">{prod.name}</h3>
                                                <div className="result-price">
                                                    <span className="price-label">Price:</span>
                                                    <span className="price">{prod.unitPrice} TL</span>
                                                </div>
                                                <div className="result-stock">
                                                    <span className="stock-label">Stock:</span>
                                                    <span className={`stock-value ${prod.unitsInStock > 0 ? "in-stock" : "out-of-stock"}`}>
                                                        {prod.unitsInStock} units
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="result-actions">
                                                <button
                                                    className={`add-to-cart-btn ${prod.unitsInStock <= 0 ? 'disabled' : ''}`}
                                                    onClick={(e) => handleAddToCart(prod.id, e)}
                                                    disabled={prod.unitsInStock <= 0}
                                                >
                                                    <span className="btn-icon">🛒</span>
                                                    {prod.unitsInStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
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
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import "./Home.css";

function Home() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);

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
    }, []);

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem("jwtToken");
        setUser(null);
        navigate("/");
    };

    // Add to Cart handler
    const handleAddToCart = async (productId) => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/app/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

            // Get user's cart first
            const cartResponse = await axios.get(
                `https://localhost:44359/api/carts/getbyid/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!cartResponse.data.success || !cartResponse.data.data) {
                alert("Cart not found for this user!");
                return;
            }

            const cartId = cartResponse.data.data.id;

            // Add product to cart
            const response = await axios.post(
                `https://localhost:44359/api/carts/addtocart?cartId=${cartId}&productId=${productId}&quantity=1`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Product added to cart!");
            } else {
                toast.error("Failed to add product to cart.");
                //alert("Failed to add product: " + response.data.message);
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error("Something went wrong while adding to cart.")
        }
    };

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="logo">
                    <span className="logo-icon">🏪</span>
                    PentaStore
                </div>
                <div className="nav-links">
                    {/* Categories Dropdown */}
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

                    {/* Profile & Cart & Logout */}
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

            {/* Products Section */}
            <div className="products-section">
                <div className="products-header">
                    <h2>Featured Products</h2>
                    <p>Discover our carefully curated collection of premium products</p>
                </div>
                <div className="products-grid">
                    {products.length > 0 ? (
                        products.map((prod) => (
                            <div key={prod.id} className="product-card">
                                <div className="product-image">
                                    <div className="product-placeholder">📦</div>
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
                                        onClick={() => handleAddToCart(prod.id)}
                                        disabled={prod.unitsInStock <= 0}
                                    >
                                        <span className="btn-icon">🛒</span>
                                        Add to Cart
                                    </button>
                                    <button
                                        className="details-btn"
                                        onClick={() => navigate(`/app/product/${prod.id}`)}
                                    >
                                        <span className="btn-icon">👁️</span>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-products">
                            <div className="no-products-icon">📋</div>
                            <p>No products available at the moment</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;
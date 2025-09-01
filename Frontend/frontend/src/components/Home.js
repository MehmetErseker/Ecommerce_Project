import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // 🔹 import düzeltildi
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

    // 🔹 Logout handler fonksiyonu
    const handleLogout = () => {
        localStorage.removeItem("jwtToken"); // token sil
        setUser(null);                       // state temizle
        navigate("/");              
    };

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="logo">PentaStore</div>
                <div className="nav-links">
                    {/* Categories Dropdown */}
                    <div className="dropdown">
                        <button
                            className="dropdown-btn"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            Categories ▾
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

                    {/* Profile & Logout */}
                    {user ? (
                        <>
                            <button onClick={() => navigate("/app/profile")}>
                                {user.firstName} {user.lastName}
                            </button>
                            <button onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate("/app/login")}>Login</button>
                            <button onClick={() => navigate("/app/register")}>Register</button>
                        </>
                    )}
                </div>
            </nav>

            <div className="hero-section">
                <h1>Welcome to PentaStore 🚀</h1>
                <p>Your secure authentication system with OTP verification</p>
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

            {/* Products Section */}
            <div className="products-section">
                <h2>Our Products</h2>
                <div className="products-grid">
                    {products.length > 0 ? (
                        products.map((prod) => (
                            <div
                                key={prod.id}
                                className="product-card"
                                onClick={() => navigate(`/app/product/${prod.id}`)}
                            >
                                <h3>{prod.name}</h3>
                                <p>Price: ${prod.unitPrice}</p>
                                <p>Stock: {prod.unitsInStock}</p>
                            </div>
                        ))
                    ) : (
                        <p>No products available</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Home;

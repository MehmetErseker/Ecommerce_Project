import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import "./CategoryPage.css";

function CategoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(`https://localhost:44359/api/categories/getbyid/${id}`);
                if (response.data.success) {
                    setCategory(response.data.data);
                } else {
                    setError("Category not found");
                }
            } catch (error) {
                console.error("Failed to fetch category:", error);
                setError("Failed to load category");
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

        fetchCategory();
        fetchUser();
    }, [id]);

    // Add to Cart handler
    const handleAddToCart = async (productId, event) => {
        event.stopPropagation(); // Prevent product card click

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
                toast.error("Cart not found for this user!");
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
                toast.error("Failed to add product: " + response.data.message);
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error("Something went wrong while adding to cart.");
        }
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    const handleViewProduct = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    if (loading) {
        return (
            <div className="category-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading category...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="category-container">
                <div className="error-container">
                    <div className="error-icon">❌</div>
                    <h2>Unable to load category</h2>
                    <p>{error}</p>
                    <button className="back-to-home-btn" onClick={handleBackToHome}>
                        <span className="home-icon">🏠</span>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="category-container">
                <div className="error-container">
                    <div className="error-icon">📂</div>
                    <h2>Category not found</h2>
                    <p>The category you're looking for doesn't exist.</p>
                    <button className="back-to-home-btn" onClick={handleBackToHome}>
                        <span className="home-icon">🏠</span>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="category-container">
            <div className="category-header">
                <button className="back-btn" onClick={handleBackToHome}>
                    <span className="back-icon">←</span>
                    Back to Store
                </button>
                <div className="category-info">
                    <h2>
                        <span className="category-icon">📂</span>
                        {category.name}
                    </h2>
                    <div className="product-count">
                        {category.products && category.products.length > 0
                            ? `${category.products.length} ${category.products.length === 1 ? 'product' : 'products'}`
                            : "No products"
                        }
                    </div>
                </div>
                <div className="header-spacer"></div>
            </div>

            <div className="category-content">
                {category.products && category.products.length > 0 ? (
                    <div className="products-grid">
                        {category.products.map((prod) => (
                            <div
                                key={prod.id}
                                className="product-card"
                                onClick={() => handleViewProduct(prod.id)}
                            >
                                <div className="product-image">
                                    <div className="product-placeholder">📦</div>
                                    {prod.unitsInStock <= 0 && (
                                        <div className="out-of-stock-overlay">
                                            <span>Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{prod.name}</h3>
                                    <div className="product-price">
                                        <span className="price-label">Price:</span>
                                        <span className="price-value">{prod.unitPrice} TL</span>
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
                                            handleViewProduct(prod.id);
                                        }}
                                    >
                                        <span className="btn-icon">👁️</span>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-products">
                        <div className="no-products-icon">📋</div>
                        <h3>No Products Found</h3>
                        <p>This category doesn't have any products yet.</p>
                        <button className="back-to-home-btn" onClick={handleBackToHome}>
                            <span className="home-icon">🏠</span>
                            Browse Other Categories
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryPage;
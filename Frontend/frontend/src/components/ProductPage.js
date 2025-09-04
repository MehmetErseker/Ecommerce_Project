import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import "./ProductPage.css";

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `https://localhost:44359/api/products/getbyid/${productId}`
                );
                if (response.data.success) {
                    const data = response.data.data;
                    // Normalize both PascalCase and camelCase keys
                    const normalizedProduct = {
                        id: data.id ?? data.Id,
                        name: data.name ?? data.Name,
                        categoryId: data.categoryId ?? data.CategoryId,
                        unitPrice: data.unitPrice ?? data.UnitPrice,
                        unitsInStock: data.unitsInStock ?? data.UnitsInStock,
                    };
                    setProduct(normalizedProduct);

                    // Fetch category information
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
    }, [productId]);

    // Add to Cart handler
    const handleAddToCart = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
            navigate("/app/login");
            return;
        }

        if (product.unitsInStock <= 0) {
            toast.error("This product is out of stock");
            return;
        }

        setAddingToCart(true);

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
                `https://localhost:44359/api/carts/addtocart?cartId=${cartId}&productId=${product.id}&quantity=1`,
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
        } finally {
            setAddingToCart(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
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
            <div className="product-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading product details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
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
        );
    }

    if (!product) {
        return (
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
        );
    }

    return (
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
                        <div className="product-placeholder">📦</div>
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
                                onClick={handleAddToCart}
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
                                        Add to Cart
                                    </>
                                )}
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
    );
}

export default ProductPage;
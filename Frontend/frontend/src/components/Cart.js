import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import "./Cart.css";
import NavigationBar from "./NavigationBar"; // ✅ Ortak navbar

function Cart() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                navigate("/app/login");
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                const response = await axios.get(
                    `https://localhost:44359/api/carts/getbyid/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    setCart(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch cart:", error);
                toast.error("Failed to load cart");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [navigate]);

    // Remove from cart function
    const handleRemove = async (productId) => {
        const token = localStorage.getItem("jwtToken");
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const cartId = cart.id;

            const response = await axios.delete(
                `https://localhost:44359/api/carts/removefromcart`,
                {
                    params: { cartId, productId },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                if (response.data.data) {
                    setCart(response.data.data);
                } else {
                    setCart((prevCart) => {
                        const updatedItems = prevCart.cartItems.filter(item => item.productId !== productId);
                        const updatedTotal = updatedItems.reduce(
                            (sum, item) => sum + item.quantity * item.unitPrice,
                            0
                        );
                        return {
                            ...prevCart,
                            cartItems: updatedItems,
                            totalPrice: updatedTotal
                        };
                    });
                }
                toast.success("Item removed from cart");
            }
        } catch (error) {
            console.error("Failed to remove item:", error);
            toast.error("Failed to remove item");
        }
    };

    // Checkout function
    const handleCheckout = async () => {
        const token = localStorage.getItem("jwtToken");
        if (!token) return;

        setCheckingOut(true);

        try {
            const decoded = jwtDecode(token);
            const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            const cartId = cart.id;

            const response = await axios.post(
                `https://localhost:44359/api/carts/checkout`,
                null,
                {
                    params: { cartId, userId },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast.success("Checkout successful! 🎉");
                setCart({ ...cart, cartItems: [], totalPrice: 0 });

                // Redirect to order history after successful checkout
                setTimeout(() => {
                    navigate("/app/orderhistory");
                }, 2000);
            }
        } catch (error) {
            console.error("Checkout failed:", error);
            toast.error("Checkout failed!");
        } finally {
            setCheckingOut(false);
        }
    };

    const handleContinueShopping = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <>
                <NavigationBar /> {/* ✅ Ortak Navigation */}
                <div className="cart-container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your cart...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!cart) {
        return (
            <>
                <NavigationBar /> {/* ✅ Ortak Navigation */}
                <div className="cart-container">
                    <div className="error-container">
                        <div className="error-icon">❌</div>
                        <h2>Unable to load cart</h2>
                        <p>Please try again later</p>
                        <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                            Return to Store
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <NavigationBar /> {/* ✅ Ortak Navigation */}
            <div className="cart-container">
                <div className="cart-header">
                    <button className="back-btn" onClick={handleContinueShopping}>
                        <span className="back-icon">←</span>
                        Continue Shopping
                    </button>
                    <h2>
                        <span className="cart-icon">🛒</span>
                        Your Shopping Cart
                    </h2>
                    <div className="cart-count">
                        {cart.cartItems.length} {cart.cartItems.length === 1 ? 'item' : 'items'}
                    </div>
                </div>

                {cart.cartItems.length > 0 ? (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cart.cartItems.map((item, index) => (
                                <div key={index} className="cart-item">
                                    <div className="item-image">
                                        <div className="product-placeholder">📦</div>
                                    </div>
                                    <div className="item-details">
                                        <h3 className="item-name">{item.productName}</h3>
                                        <div className="item-info">
                                            <span className="item-price">
                                                <span className="price-label">Unit Price:</span>
                                                <span className="price-value">{item.unitPrice} TL</span>
                                            </span>
                                            <span className="item-quantity">
                                                <span className="quantity-label">Quantity:</span>
                                                <span className="quantity-value">{item.quantity}</span>
                                            </span>
                                            <span className="item-subtotal">
                                                <span className="subtotal-label">Subtotal:</span>
                                                <span className="subtotal-value">{(item.quantity * item.unitPrice).toFixed(2)} TL</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button
                                            className="remove-btn"
                                            onClick={() => handleRemove(item.productId)}
                                            title="Remove from cart"
                                        >
                                            <span className="remove-icon">🗑️</span>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="summary-content">
                                <div className="summary-row">
                                    <span className="summary-label">Items ({cart.cartItems.length}):</span>
                                    <span className="summary-value">{cart.totalPrice.toFixed(2)} TL</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Shipping:</span>
                                    <span className="summary-value free">FREE</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span className="summary-label">Total:</span>
                                    <span className="summary-value">{cart.totalPrice.toFixed(2)} TL</span>
                                </div>
                            </div>

                            <button
                                className={`checkout-btn ${checkingOut ? 'loading' : ''}`}
                                onClick={handleCheckout}
                                disabled={checkingOut}
                            >
                                {checkingOut ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="checkout-icon">💳</span>
                                        Proceed to Checkout
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Looks like you haven't added any items to your cart yet.</p>
                        <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                            <span className="shopping-icon">🛍️</span>
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Cart;

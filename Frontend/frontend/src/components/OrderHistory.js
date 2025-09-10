import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import "./OrderHistory.css";

function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                navigate("/app/login");
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

                const response = await axios.get(
                    `https://localhost:44359/api/orders/getbyuserid/${userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.success) {
                    // 🔽 Yeni ekleme: Siparişleri tarihe göre azalan sırada (en son sipariş en üstte)
                    const sortedOrders = [...response.data.data].sort(
                        (a, b) => new Date(b.date) - new Date(a.date)
                    );
                    setOrders(sortedOrders);
                } else {
                    toast.error("Failed to load orders");
                }
            } catch (error) {
                console.error("Error loading orders:", error);
                toast.error("Error loading order history");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const toggleOrderExpansion = (index) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedOrders(newExpanded);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered':
            case 'tamamlandı':
                return 'status-completed';
            case 'pending':
            case 'beklemede':
                return 'status-pending';
            case 'processing':
            case 'işleniyor':
                return 'status-processing';
            case 'cancelled':
            case 'iptal':
                return 'status-cancelled';
            default:
                return 'status-default';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleContinueShopping = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <div className="order-history-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading">Loading your order history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <div className="order-header">
                <button className="back-btn" onClick={handleContinueShopping}>
                    <span className="back-icon">←</span>
                    Back to Store
                </button>
                <h2>
                    <span className="order-icon">📦</span>
                    Order History
                </h2>
                <div className="order-count">
                    {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <div className="no-orders-icon">📋</div>
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders yet. Start shopping to see your order history here.</p>
                    <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                        <span className="shopping-icon">🛍️</span>
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order, index) => (
                        <div key={index} className="order-card">
                            <div className="order-summary" onClick={() => toggleOrderExpansion(index)}>
                                <div className="order-info">
                                    <div className="order-date">
                                        <span className="date-icon">📅</span>
                                        <span className="date-text">{formatDate(order.date)}</span>
                                    </div>
                                    <div className="order-status">
                                        <span className={`status-badge ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    <div className="order-total">
                                        <span className="total-label">Total:</span>
                                        <span className="total-amount">{order.totalPrice.toFixed(2)} TL</span>
                                    </div>
                                </div>
                                <div className="order-actions">
                                    <div className="items-count">
                                        {order.orderDetails.length} {order.orderDetails.length === 1 ? 'item' : 'items'}
                                    </div>
                                    <button className="expand-btn">
                                        <span className={`expand-icon ${expandedOrders.has(index) ? 'expanded' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {expandedOrders.has(index) && (
                                <div className="order-details">
                                    <div className="details-header">
                                        <h4>
                                            <span className="details-icon">📋</span>
                                            Order Details
                                        </h4>
                                    </div>
                                    <div className="order-items">
                                        {order.orderDetails.map((detail, i) => (
                                            <div key={i} className="order-item">
                                                <div className="item-image">
                                                    <div className="product-placeholder">📦</div>
                                                </div>
                                                <div className="item-info">
                                                    <h5 className="item-name">
                                                        {detail.productName || "Product name not available"}
                                                    </h5>
                                                    <div className="item-details">
                                                        <span className="item-quantity">
                                                            <span className="detail-label">Quantity:</span>
                                                            <span className="detail-value">{detail.quantity}</span>
                                                        </span>
                                                        <span className="item-price">
                                                            <span className="detail-label">Unit Price:</span>
                                                            <span className="detail-value">{detail.price.toFixed(2)} TL</span>
                                                        </span>
                                                        <span className="item-subtotal">
                                                            <span className="detail-label">Subtotal:</span>
                                                            <span className="detail-value">
                                                                {(detail.price * detail.quantity).toFixed(2)} TL
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-summary-total">
                                        <div className="summary-row">
                                            <span className="summary-label">Items ({order.orderDetails.length}):</span>
                                            <span className="summary-value">{order.totalPrice.toFixed(2)} TL</span>
                                        </div>
                                        <div className="summary-row">
                                            <span className="summary-label">Shipping:</span>
                                            <span className="summary-value free">FREE</span>
                                        </div>
                                        <div className="summary-divider"></div>
                                        <div className="summary-row total">
                                            <span className="summary-label">Order Total:</span>
                                            <span className="summary-value">{order.totalPrice.toFixed(2)} TL</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;

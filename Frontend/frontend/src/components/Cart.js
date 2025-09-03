import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Cart.css";

function Cart() {
    const [cart, setCart] = useState(null);

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem("jwtToken");
            if (!token) return;

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
            }
        };

        fetchCart();
    }, []);

    if (!cart) return <p>Loading cart...</p>;

    return (
        <div className="cart-container">
            <h2>Your Cart</h2>
            {cart.cartItems.length > 0 ? (
                <ul className="cart-items">
                    {cart.cartItems.map((item) => (
                        <li key={item.id} className="cart-item">
                            <span>{item.product.name}</span>
                            <span>Quantity: {item.quantity}</span>
                            <span>UnitPrice: {item.product.unitPrice} TL</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Your cart is empty.</p>
            )}
            <h3>Total: {cart.totalPrice} TL</h3>
        </div>
    );
}

export default Cart;

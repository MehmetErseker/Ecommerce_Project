import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import ProductPage from "./components/ProductPage";
import CategoryPage from "./components/CategoryPage";
import Profile from "./components/Profile";
import Cart from "./components/Cart";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/app/register" element={<RegisterForm />} />
                <Route path="/app/login" element={<LoginForm />} />
                <Route path="/app/product/:productId" element={<ProductPage />} />
                <Route path="/app/category/:id" element={<CategoryPage />} />
                <Route path="/app/profile" element={<Profile />} />
                <Route path="/app/cart" element={<Cart />} />

            </Routes>
        </Router>
    );
}

export default App;

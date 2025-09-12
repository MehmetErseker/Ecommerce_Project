import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import ProductPage from "./components/ProductPage";
import CategoryPage from "./components/CategoryPage";
import Profile from "./components/Profile";
import Cart from "./components/Cart";
import OrderHistory from "./components/OrderHistory";
import SearchPage from "./components/SearchPage";
import NavigationBar from "./components/NavigationBar";

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
                <Route path="/app/orderhistory" element={<OrderHistory />} />
                <Route path="/app/search" element={<SearchPage />} />
                <Route path="/app/*" element={<NavigationBar />} />
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </Router>
    );
}

export default App;
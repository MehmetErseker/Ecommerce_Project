import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CategoryPage.css";

function CategoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(`https://localhost:44359/api/categories/getbyid/${id}`);
                if (response.data.success) {
                    // API'den gelen "data" aslında category objesi
                    setCategory(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch category:", error);
            }
        };

        fetchCategory();
    }, [id]);

    if (!category) {
        return <div className="category-container">Loading category...</div>;
    }

    return (
        <div className="category-container">
            <h2>Category: {category.name}</h2>
            <div className="products-grid">
                {category.products && category.products.length > 0 ? (
                    category.products.map((prod) => (
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
                    <p>No products found in this category.</p>
                )}
            </div>
        </div>
    );
}

export default CategoryPage;

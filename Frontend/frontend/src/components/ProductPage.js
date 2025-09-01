import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductPage.css";

function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `https://localhost:44359/api/products/getbyid/${productId}`
                );

                if (response.data.success) {
                    const data = response.data.data;

                    // Hem PascalCase hem camelCase key'leri normalize et
                    const normalizedProduct = {
                        id: data.id ?? data.Id,
                        name: data.name ?? data.Name,
                        categoryId: data.categoryId ?? data.CategoryId,
                        unitPrice: data.unitPrice ?? data.UnitPrice,
                        unitsInStock: data.unitsInStock ?? data.UnitsInStock,
                    };

                    setProduct(normalizedProduct);
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            }
        };

        fetchProduct();
    }, [productId]);

    if (!product) {
        return <div className="product-container">Loading product details...</div>;
    }

    return (
        <div className="product-container">
            <div className="product-card-detail">
                <h1>{product.name}</h1>
                <p>
                    <strong>Category ID:</strong> {product.categoryId}
                </p>
                <p>
                    <strong>Price:</strong> ${product.unitPrice}
                </p>
                <p>
                    <strong>Stock:</strong> {product.unitsInStock}
                </p>
                <button className="btn-back" onClick={() => navigate("/")}>
                    ⬅ Back to Home
                </button>
            </div>
        </div>
    );
}

export default ProductPage;

import React, { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
import "./ProductDescription.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { useParams } from "react-router-dom";

const ProductDescription = ({ productId }) => {
    const [activeTab, setActiveTab] = useState("overview");
     const { id } = useParams();
     console.log("🚀 Product ID from URL:", id);
    const [formData, setFormData] = useState({
        productId: "",
        description: "",
    });
useEffect(() => {
    if (id) {
        setFormData((prev) => ({
            ...prev,
            productId: id,
        }));
    }
}, [id]);
    // Added only this missing state (no other logic changed)
    const [reviews, setReviews] = useState([
        {
            email: "sandeep@gmail.com",
            rating: 4.5,
            comment: "Very nice product. Quality is good and delivery was fast."
        },

        {
            email: "akash@example.com",
            rating: 5,
            comment: "Best product in India."
        }

    ]);
const handleSubmit = async () => {
    try {
        console.log("📦 Sending Product ID:", id);
        console.log("📝 Sending Description:", formData.description);

        console.log("🔥 FULL BODY:", {
            productId: id,
            description: formData.description
        });

        const response = await axios.post(
            `${BASE_URL}/api/subcategories/products/overview`, // ✅ corrected route
            {
                productId: id,
                description: formData.description
            }
        );

        console.log("✅ Server Response:", response.data);
        alert("Product Overview Saved Successfully ✅");

    } catch (error) {
        console.log("❌ Error:", error.response?.data || error.message);
        alert("Error saving product overview ❌");
    }
};

    // 🔥 ADD HERE
    useEffect(() => {
        if (!id) return;

        const fetchOverview = async () => {
            try {
                const response = await axios.get(
                    `${BASE}/api/products/${id}`
                );

                setFormData((prev) => ({
                    ...prev,
                    productId: response.data.id || response.data._id,
                    description: response.data.description || "",
                }));

                setReviews(response.data.reviews || []);

            } catch (error) {
                console.log("Error fetching overview:", error);
            }
        };

        fetchOverview();
    }, [productId]);

    return (
        <div className="pd-container">

            {/* Buttons */}
            <div className="pd-button-group">
                <button
                    className={`pd-btn ${activeTab === "overview" ? "active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    Product Overview
                </button>

                <button
                    className={`pd-btn ${activeTab === "review" ? "active" : ""}`}
                    onClick={() => setActiveTab("review")}
                >
                    Buyer Reviews
                </button>
            </div>

            {/* Content */}
            <div className="pd-content">

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <div>

                        {/* ✅ Product ID Field Added */}
                        <div className="pd-input-group">
                            <label>Product ID</label>
                            <input
                                type="text"
                                value={formData.productId}
                                readOnly
                            />
                        </div>

                        <label>Description</label>

                        <CKEditor
                            editor={ClassicEditor}
                            data={formData.description}
                            onChange={(event, editor) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    description: editor.getData(),
                                }));
                            }}
                        />
                    </div>
                )}

                {/* REVIEW TAB */}
                {activeTab === "review" && (
                    <div className="reviews-container">
                        {reviews.length === 0 ? (
                            <p className="no-reviews">No reviews yet.</p>
                        ) : (
                            reviews.map((review, index) => (
                                <div key={index} className="review-box">
                                    <p className="review-email">
                                        {review.email}
                                    </p>

                                    <div className="po-review-stars">
                                        {Array.from({ length: 5 }, (_, i) => {
                                            if (i + 1 <= Math.floor(review.rating)) {
                                                return "★"; // full star
                                            } else if (i < review.rating) {
                                                return "⯪"; // half star
                                            } else {
                                                return "☆"; // empty star
                                            }
                                        }).join("")} ({review.rating} rating)
                                    </div>

                                    <p className="review-comment">
                                        {review.comment}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
                  <div className="pd-submit-wrapper">
               <button
    type="button"
    className="pd-submit-btn"
    onClick={handleSubmit}
>
    Submit
</button>
            </div>
            
            </div>
        </div>

    );
};

export default ProductDescription;

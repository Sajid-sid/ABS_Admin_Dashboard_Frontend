import React, { useState } from "react";
import "./ProductDescription.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";



const ProductDescription = () => {
    const [activeTab, setActiveTab] = useState("overview");

    const [formData, setFormData] = useState({
        description: "",
    });

    // Added only this missing state (no other logic changed)
    const [reviews, setReviews] = useState([
        {
            email: "sandeep@gmail.com",
            rating: 4.5,
            comment: "Very nice product. Quality is good and delivery was fast."
        },

        {
            email:"akash@example.com",
            rating: 5,
            comment: "Best product in India."
        }
        
    ]);

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
            </div>
        </div>
    );
};

export default ProductDescription;

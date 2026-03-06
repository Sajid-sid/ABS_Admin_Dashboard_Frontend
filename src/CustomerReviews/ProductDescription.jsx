import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ProductDescription.css";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ProductDescription = () => {
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("overview");

  const [formData, setFormData] = useState({
    productId: "",
    description: "",
  });

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  

  /* Pagination State */
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  /* ---------------- SET PRODUCT ID ---------------- */

  useEffect(() => {
    if (id) {
      setFormData((prev) => ({
        ...prev,
        productId: id,
      }));
    }
  }, [id]);

  /* ---------------- FETCH PRODUCT OVERVIEW ---------------- */

  useEffect(() => {
    if (!id) return;

    const fetchOverview = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/subcategories/products/overview/${id}`
        );

        setFormData({
          productId: id,
          description: res.data?.description || "",
        });
      } catch (error) {
        if (error.response?.status === 404) {
          setFormData({
            productId: id,
            description: "",
          });
        } else {
          console.log("Overview fetch error:", error);
        }
      }
    };

    fetchOverview();
  }, [id]);

  /* ---------------- FETCH REVIEWS ---------------- */

  useEffect(() => {
    if (!id) return;

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);

        const res = await axios.get(`${BASE_URL}/api/reviews/reviews/${id}`);

        let reviewData = [];

        if (Array.isArray(res.data)) {
          reviewData = res.data;
        } else if (Array.isArray(res.data.reviews)) {
          reviewData = res.data.reviews;
        } else if (Array.isArray(res.data.data)) {
          reviewData = res.data.data;
        }

        setReviews(reviewData);
      } catch (error) {
        console.log("Review fetch error:", error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  /* ---------------- PAGINATION LOGIC ---------------- */

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  /* ---------------- SAVE OVERVIEW ---------------- */

  const handleSubmit = async () => {
    try {
      await axios.post(`${BASE_URL}/api/subcategories/products/overview`, {
        productId: id,
        description: formData.description,
      });

      alert("Product Overview Saved Successfully ✅");
    } catch (error) {
      console.log("Save error:", error);
      alert("Error saving product overview ❌");
    }
  };

  return (
    <div className="pd-container">

      {/* TAB BUTTONS */}

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
          Buyer Reviews ({reviews.length})
        </button>
      </div>

      {/* TAB CONTENT */}

      <div className="pd-content">

        {/* OVERVIEW TAB */}

        {activeTab === "overview" && (
          <div>

            <div className="pd-input-group">
              <label>Product ID</label>
              <input type="text" value={formData.productId} readOnly />
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
        )}

        {/* REVIEW TAB */}

        {activeTab === "review" && (
          <div className="reviews-container">

            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet.</p>
            ) : (
              <>
                {currentReviews.map((review, index) => (
                  <div key={index} className="review-box">

                    <p className="review-email">
                      {review.email || review.userEmail}
                    </p>

                    <div className="po-review-stars">
                      {Array.from({ length: 5 }, (_, i) => {
                        if (i + 1 <= Math.floor(review.rating)) return "★";
                        if (i < review.rating) return "⯪";
                        return "☆";
                      }).join("")}{" "}
                      ({review.rating})
                    </div>

                    <p className="review-comment">
                      {review.comment}
                    </p>

                  </div>
                ))}

                {/* PAGINATION */}

                {totalPages > 1 && (
                  <div className="pagination">

                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </button>

                    <span>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </button>

                  </div>
                )}
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDescription;
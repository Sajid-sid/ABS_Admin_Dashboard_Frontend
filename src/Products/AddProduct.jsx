import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    productName: "",
    productImage: null,
  });
  const [preview, setPreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // ✅ Load from .env
  const BASE_URL = import.meta.env.VITE_API_URL;
  const API_URL = `${BASE_URL}/api/products`;

  // ✅ Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "productImage") {
      const file = files[0];
      setFormData({ ...formData, productImage: file });
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Add or Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.productName.trim().toLowerCase();

    // 🧠 Check duplicate name (excluding current editing product)
    const nameExists = products.some(
      (p) => p.productName.trim().toLowerCase() === trimmedName && p.id !== editId
    );

    if (nameExists) {
      alert("⚠️ Product name already exists. Please choose a different name.");
      return;
    }

    const data = new FormData();
    data.append("productName", formData.productName);
    if (formData.productImage) {
      data.append("productImage", formData.productImage);
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product updated successfully!");
      } else {
        if (!formData.productImage) {
          alert("⚠️ Please upload a product image before adding.");
          return;
        }
        await axios.post(API_URL, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Product added successfully!");
      }

      setFormData({ productName: "", productImage: null });
      setPreview(null);
      setEditId(null);
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      console.error("❌ Error saving product:", err);
    }
  };

  // ✅ Edit Product
  const handleEdit = (product) => {
    setFormData({ productName: product.productName, productImage: null });
    setPreview(product.productImage);
    setEditId(product.id);
    setShowForm(true);
  };

  // ✅ Delete Product
  const handleDelete = async (id) => {
    console.log("Deleting ID:", id); // <-
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("🗑️ Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  return (
    <div className="product-page-container">
      <h2>Products</h2>

      <button className="add-btn" onClick={() => setShowForm(true)}>
        + Product
      </button>

      <div className="product-gallery">
        {products.length === 0 ? (
          <p className="no-products">No products available</p>
        ) : (
          products.map((prod) => (
            <div key={prod.id} className="product-card">
              <img
                src={prod.productImage}
                alt={prod.productName}
                className="product-avatar"
              />
              <p>{prod.productName}</p>
              <div className="actions">
                <button onClick={() => handleEdit(prod)}>✏️</button>
                <button onClick={() => handleDelete(prod.id)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editId ? "Update Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Product Name</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />

              <label>Product Image</label>
              <input
                type="file"
                name="productImage"
                accept="image/*"
                onChange={handleChange}
              />

              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}

              <div className="form-actions">
                <button type="submit">{editId ? "Update" : "Add"}</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProduct;

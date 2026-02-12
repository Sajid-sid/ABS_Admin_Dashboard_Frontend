import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AddProductCategory.css"; // You can reuse same CSS

const AddProductCategory = () => {
  const [formData, setFormData] = useState({
    productName: "",
    productCategory: "",
    productCategoryImage: null,
  });
  const [preview, setPreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const PRODUCT_API = `${BASE_URL}/api/products`;
  const CATEGORY_API = `${BASE_URL}/api/productCategories`;

  // Fetch product names for dropdown
  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API);
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch product list:", err);
    }
  };

  //  Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API);
      setCategories(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  //  Handle Input Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "productCategoryImage") {
      const file = files[0];
      setFormData({ ...formData, productCategoryImage: file });
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add or Update Category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName || !formData.productCategory) {
      alert("⚠️ Please fill all fields.");
      return;
    }

    const data = new FormData();
    data.append("productName", formData.productName);
    data.append("productCategory", formData.productCategory);
    if (formData.productCategoryImage) {
      data.append("productCategoryImage", formData.productCategoryImage);
    }

    try {
      if (editId) {
        await axios.put(`${CATEGORY_API}/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(" Category updated successfully!");
      } else {
        await axios.post(CATEGORY_API, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert(" Category added successfully!");
      }

      setFormData({
        productName: "",
        productCategory: "",
        productCategoryImage: null,
      });
      setPreview(null);
      setEditId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("❌ Failed to save category. Please try again.");
    }
  };

  //  Edit Category
  const handleEdit = (cat) => {
    setFormData({
      productName: cat.productName,
      productCategory: cat.productCategory,
      productCategoryImage: null,
    });
    setPreview(`${BASE_URL}${cat.productCategoryImage}`);
    setEditId(cat.id);
    setShowForm(true);
  };


  const handleDelete = async (cat) => {
    try {
      //  Fetch subcategories
      const subRes = await axios.get(`${BASE_URL}/api/subcategories`);
      const subcategories = subRes.data || [];

      //  Check if category is used
      const linkedSubs = subcategories.filter(
        (sub) => sub.productCategory === cat.productCategory
      );

      //  If products exist → STOP delete
      if (linkedSubs.length > 0) {
        alert(
          `❌ This category has ${linkedSubs.length} products under it.\n\nDelete the products first, then you can delete this category.`
        );
        return;
      }

      //  Normal delete
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this category?"
      );
      if (!confirmDelete) return;

      await axios.delete(`${CATEGORY_API}/${cat.id}`);
      alert("🗑️ Category deleted successfully!");
      fetchCategories();

    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };



  return (
    <div className="product-page-container">
      <h2>Product Categories</h2>

      <button className="add-btn" onClick={() => setShowForm(true)}>
        + Category
      </button>

      {/*  Categories Gallery */}
      <div className="product-gallery">
        {categories.length === 0 ? (
          <p className="no-products">No categories available</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="product-card">
              <img
                src={`${BASE_URL}${cat.productCategoryImage}`}
                alt={cat.productCategory}
                className="product-avatar"
                onError={(e) => (e.target.src = "/no-image.png")}
              />
              <p>
                <strong>{cat.productName}</strong> — {cat.productCategory}
              </p>
              <div className="actions">
                <button onClick={() => handleEdit(cat)}>✏️</button>
                <button onClick={() => handleDelete(cat)}>🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/*  Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editId ? "Update Category" : "Add Category"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Product Name</label>
              <select
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.productName}>
                    {p.productName}
                  </option>
                ))}
              </select>

              <label>Product Category</label>
              <input
                type="text"
                name="productCategory"
                value={formData.productCategory}
                onChange={handleChange}
                placeholder="Enter product category"
                required
              />

              <label>Category Image</label>
              <input
                type="file"
                name="productCategoryImage"
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

export default AddProductCategory;
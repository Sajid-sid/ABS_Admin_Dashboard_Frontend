// src/components/AddSubCategory.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./AddSubCategory.css";

const AddSubCategory = () => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const initialState = {
    productCategory: "",
    subCategaryname: "",
    price: "",
    material: "",
    sku: "",
    brand: "",
    description: "",
    gender: "",
    image_1: null,
    image_2: null,
    image_3: null,
    image_4: null,
  };

  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});
  const [imagePreview, setImagePreview] = useState({
    image_1: "",
    image_2: "",
    image_3: "",
    image_4: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showProducts, setShowProducts] = useState(false);



  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get(`${BASE_URL}/api/productCategories`);
    setCategories(res.data || []);
  };

  const fetchSubCategories = async () => {
    const res = await axios.get(`${BASE_URL}/api/subcategories`);
    setSubCategories(res.data || []);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));

      setImagePreview((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        form.append(key, value);
      }
    });

    if (editingId) {
      await axios.put(`${BASE_URL}/api/subcategories/${editingId}`, form);
      alert("Subcategory updated successfully");
    } else {
      await axios.post(`${BASE_URL}/api/subcategories`, form);
      alert("Subcategory added successfully");
    }

    setEditingId(null);
    setFormData(initialState);
    fetchSubCategories();
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);

    setFormData({
      productCategory: sub.productCategory || "",
      subCategaryname: sub.subCategaryname || "",
      price: sub.price || "",
      material: sub.material || "",
      sku: sub.sku || "",
      brand: sub.brand || "",
      description: sub.description || "",
      gender: sub.gender || "",
      image_1: null,
      image_2: null,
      image_3: null,
      image_4: null,
    });

    setImagePreview({
      image_1: sub.image_1 ? getImageUrl(sub.image_1) : "",
      image_2: sub.image_2 ? getImageUrl(sub.image_2) : "",
      image_3: sub.image_3 ? getImageUrl(sub.image_3) : "",
      image_4: sub.image_4 ? getImageUrl(sub.image_4) : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    await axios.delete(`${BASE_URL}/api/subcategories/${id}`);
    fetchSubCategories();
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path}`;
  };

  const filteredSubCategories = subCategories.filter((sub) => {
  const term = searchTerm.toLowerCase();

  return (
    sub.subCategaryname?.toLowerCase().includes(term) ||
    sub.sku?.toLowerCase().includes(term) ||
    sub.productCategory?.toLowerCase().includes(term)
  );
});


  return (
    <div className="subcategory-container">
      <h2 className="subcategory-title">
        {editingId ? "Update Sub Category" : "Add Sub Category"}
      </h2>

      {/* FORM */}
      <form className="subcategory-form" onSubmit={handleSubmit}>
        <div className="subcategory-row">
          <div className="subcategory-field">
            <label>Product Category</label>
            <select
              name="productCategory"
              value={formData.productCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.categoryname || cat.productCategory}>
                  {cat.categoryname || cat.productCategory}
                </option>
              ))}
            </select>
          </div>

          <div className="subcategory-field">
            <label>Sub Category Name</label>
            <input
              type="text"
              name="subCategaryname"
              value={formData.subCategaryname}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="subcategory-row">
          <div className="subcategory-field">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="subcategory-field">
            <label>SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="subcategory-row">
          <div className="subcategory-field">
            <label>Material</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
            />
          </div>

          <div className="subcategory-field">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="subcategory-row">
          <div className="subcategory-field">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
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

        <div className="subcategory-row">
          <div className="subcategory-field">
            <label>Image 1</label>
            <input type="file" name="image_1" onChange={handleChange} />
          </div>
          <div className="subcategory-field">
            <label>Image 2</label>
            <input type="file" name="image_2" onChange={handleChange} />
          </div>
        </div>

        <div className="subcategory-row">
          <div className="subcategory-field">
            <label>Image 3</label>
            <input type="file" name="image_3" onChange={handleChange} />
          </div>
          <div className="subcategory-field">
            <label>Image 4</label>
            <input type="file" name="image_4" onChange={handleChange} />
          </div>
        </div>
        {editingId && (
          <div className="image-preview-grid">
            {Object.entries(imagePreview).map(
              ([key, src]) =>
                src && (
                  <div key={key} className="image-preview-card">
                    <img src={src} alt={key} />
                    <p>{key.replace("_", " ").toUpperCase()}</p>
                  </div>
                )
            )}
          </div>
        )}


        <button className="subcategory-btn" type="submit">
          {editingId ? "Update" : "Submit"}
        </button>
      </form>

    


<div style={{ textAlign: "right", marginTop: "20px" }}>
  <button
    className="subcategory-btn"
    type="button"
    onClick={() => setShowProducts((prev) => !prev)}
  >
    {showProducts ? "Hide Products" : "View Products"}
  </button>
</div>


   {showProducts && (
  <>
    <h3 className="list-title">Existing Subcategories</h3>
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name, SKU or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

    <div className="subcategory-card-grid">
      {filteredSubCategories.map((sub) => {

          const images = [sub.image_1, sub.image_2, sub.image_3, sub.image_4].filter(Boolean);
          const index = carouselIndex[sub.id] || 0;



          return (
            <div className="subcategory-card" key={sub.id}>
              {images.length > 0 && (
                <div className="carousel">
                  <img
                    src={getImageUrl(images[index])}
                    alt={sub.subCategaryname}
                    className="carousel-image"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="carousel-btn left"
                        onClick={() =>
                          setCarouselIndex((p) => ({
                            ...p,
                            [sub.id]: index === 0 ? images.length - 1 : index - 1,
                          }))
                        }
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        className="carousel-btn right"
                        onClick={() =>
                          setCarouselIndex((p) => ({
                            ...p,
                            [sub.id]: (index + 1) % images.length,
                          }))
                        }
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
              )}

              <h4>{sub.subCategaryname}</h4>
              <p><b>Category:</b> {sub.productCategory}</p>
              <p><b>Price:</b> ₹{sub.price}</p>
              <p><b>SKU:</b> {sub.sku}</p>

              <div className="card-actions">
                <button className="edit-btn" onClick={() => handleEdit(sub)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(sub.id)}>Delete</button>
              </div>
            </div>
          );
        })}
         </div>
  </>
)}
    </div>
  );
};

export default AddSubCategory;

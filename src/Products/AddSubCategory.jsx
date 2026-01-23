// src/components/AddSubCategory.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./AddSubCategory.css";

const AddSubCategory = () => {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [formData, setFormData] = useState({
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
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/productCategories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };



  const fetchSubCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subcategories`);
      setSubCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching subcategories", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((p) => ({ ...p, [name]: files[0] }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };


  // CKEditor custom upload adapter (Image + Video)
  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
      this.url = `${BASE_URL}/api/subcategories/upload-image`;
    }

    async upload() {
      const file = await this.loader.file;

      const data = new FormData();
      data.append("upload", file);

      const res = await axios.post(this.url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.default) {
        throw new Error("Image upload failed");
      }

      // ✅ THIS inserts <img src="..."> correctly
      return {
        default: res.data.default,
      };
    }

    abort() { }
  }



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) form.append(key, value);
      });

      if (editingId) {
        await axios.put(`${BASE_URL}/api/subcategories/${editingId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Subcategory updated successfully");
      } else {
        await axios.post(`${BASE_URL}/api/subcategories`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Subcategory added successfully");
      }

      setFormData({
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
      });
      setEditingId(null);
      fetchSubCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleEdit = (subcategory) => {
    setEditingId(subcategory.id);
    setFormData({
      productCategory: subcategory.productCategory,
      subCategaryname: subcategory.subCategaryname,
      price: subcategory.price,
      material: subcategory.material,
      sku: subcategory.sku,
      brand: subcategory.brand,
      description: subcategory.description || "",
      gender: subcategory.gender,
      image_1: null,
      image_2: null,
      image_3: null,
      image_4: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/subcategories/${id}`);
      alert("🗑️ Deleted successfully");
      fetchSubCategories();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="subcategory-container">
      <h2>{editingId ? "Update Sub Category" : "Add Sub Category"}</h2>

      <form className="subcategory-form" onSubmit={handleSubmit}>
        {/* Row 1 */}
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

        {/* Row 2 */}
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

        {/* Row 3 */}
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

        {/* Row 4 */}
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

        {/* Description */}
        <label>Description</label>
        <CKEditor
          editor={ClassicEditor}
          config={{
            extraPlugins: [MyCustomUploadAdapterPlugin],
            toolbar: [
              "heading", "|",
              "bold", "italic", "underline", "|",
              "bulletedList", "numberedList", "|",
              "link", "imageUpload", "mediaEmbed", "|",
              "undo", "redo"
            ],
            mediaEmbed: {
              previewsInData: true,
            },
          }}
          data={formData.description}
          onChange={(event, editor) => {
            setFormData((p) => ({ ...p, description: editor.getData() }));
          }}
        />



        {/* IMAGES */}
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

        <button className="subcategory-btn" type="submit">
          {editingId ? "Update" : "Submit"}
        </button>
      </form>

      {/* LIST */}
      <div className="subcategory-list">
        <h3>Existing Subcategories</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Name</th>
              <th>Price</th>
              <th>SKU</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subCategories.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.id}</td>
                <td>{sub.productCategory}</td>
                <td>{sub.subCategaryname}</td>
                <td>{sub.price}</td>
                <td>{sub.sku}</td>
                <td>
                  <button onClick={() => handleEdit(sub)}>Edit</button>
                  <button onClick={() => handleDelete(sub.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddSubCategory;

// src/components/AddSubCategory.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "./AddSubCategory.css";
import { DndContext, closestCenter, } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


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
    media: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState({});
  const [mediaFiles, setMediaFiles] = useState([]);

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
      const selectedFiles = Array.from(files);

      if (mediaFiles.length + selectedFiles.length > 10) {
        alert("Maximum 10 media files allowed");
        return;
      }

      const newMedia = selectedFiles.map((file) => ({
        id: URL.createObjectURL(file),
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      }));

      setMediaFiles((prev) => [...prev, ...newMedia]);

    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();

    mediaFiles.forEach((item, index) => {
      if (item.file) {
        form.append("media", item.file); // new files
      } else if (item.existing) {
        form.append("existingMedia[]", item.url); // old files
      }
    });


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

    if (editingId) {
  await axios.put(`${BASE_URL}/api/subcategories/${editingId}`, form);
  alert("Updated");
} else {
  await axios.post(`${BASE_URL}/api/subcategories`, form);
  alert("Added");
}

/*  FULL FORM RESET */
setEditingId(null);
setFormData(initialState);
setMediaFiles([]);
setCarouselIndex({});
fetchSubCategories();


    setEditingId(null);
    setFormData(initialState);
    fetchSubCategories();
  };

  const handleEdit = (sub) => {
    console.log(sub);
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
      media: sub.media || [],
    });

    setMediaFiles(
      (sub.media || []).map((url) => ({
        id: url,
        preview: getImageUrl(url),
        type: url.match(/\.(mp4|webm|ogg)$/) ? "video" : "image",
        existing: true,
        url,
      }))
    );



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

    // ensure leading slash
    if (!path.startsWith("/")) {
      path = "/" + path;
    }

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


  const SortableItem = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      cursor: "grab",
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="media-preview-card">
        {item.type === "image" ? (
          <img src={item.preview} alt="" />
        ) : (
          <video src={item.preview} controls />
        )}
      </div>
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      setMediaFiles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };



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
            <label>Add Media (Max 10 Images/Videos)</label>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleChange}
            />
          </div>

        </div>

        {mediaFiles.length > 0 && (
          <div className="media-preview-grid">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={mediaFiles.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {mediaFiles.map((item) => (
                  <div key={item.id} className="media-preview-card-wrapper">
                    <SortableItem item={item} />
                    <button
                      type="button"
                      className="delete-media-btn"
                      onClick={() => {
                        if (mediaFiles.length === 1) {
                          alert("At least one media file is required.");
                          return;
                        }
                        setMediaFiles((prev) =>
                          prev.filter((m) => m.id !== item.id)
                        );
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </SortableContext>
            </DndContext>
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

          <div className="subcategory-card-grid">
            {filteredSubCategories.map((sub) => {
              const images = sub.media || [];
              const index = carouselIndex[sub.id] || 0;
              const current = images[index];

              return (
                <div className="subcategory-card" key={sub.id}>
                  {images.length > 0 && (
                    <div className="carousel">
                      {(() => {
                        const url = getImageUrl(current);
                        const isVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);

                        return isVideo ? (
                          <video
                            key={url}
                            src={url}
                            className="carousel-image"
                            controls
                            autoPlay
                            muted
                            loop
                          />
                        ) : (
                          <img
                            key={url}
                            src={url}
                            alt={sub.subCategaryname}
                            className="carousel-image"
                          />
                        );
                      })()}


                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            className="carousel-btn left"
                            onClick={() =>
                              setCarouselIndex((p) => ({
                                ...p,
                                [sub.id]:
                                  index === 0 ? images.length - 1 : index - 1,
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
                    <button className="delete-sub-btn" onClick={() => handleDelete(sub.id)}>Delete</button>

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

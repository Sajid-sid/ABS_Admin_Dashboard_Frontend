import React, { useEffect, useState } from "react";
import axios from "axios";
import "./BannerManager.css";

export default function BannerManager() {
  const API = import.meta.env.VITE_API_URL;

  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("aspirebrandstore"); // default
  const [platform, setPlatform] = useState("website"); // default
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  // Fetch banners
  const loadBanners = async () => {
    try {
      const res = await axios.get(`${API}/api/banner/all`);
      
      setBanners(res.data || []);
    } catch (err) {
      console.log("Error fetching banners", err);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Select image
  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const getBannerImageUrl = (path) => {
    if (!path) return "";

    // already absolute (safe guard)
    if (path.startsWith("http")) return path;

    return `${import.meta.env.VITE_API_URL}${path}`;
  };



  // Submit Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) return alert("Please enter a banner title");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("project", project);
    formData.append("platform", platform);

    if (image) formData.append("bannerImage", image);

    try {
      if (editId) {
        await axios.put(`${API}/api/banner/update/${editId}`, formData);
        alert("Banner updated!");
      } else {
        await axios.post(`${API}/api/banner/add`, formData);
        alert("Banner added!");
      }

      // Reset fields
      setTitle("");
      setProject("aspirebrandstore");
      setPlatform("website");
      setImage(null);
      setPreview(null);
      setEditId(null);

      loadBanners();
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  // Edit
  const editBanner = (b) => {
    setEditId(b.id);
    setTitle(b.title);
    setProject(b.project);
    setPlatform(b.platform);
    setPreview(getBannerImageUrl(b.bannerImage));
  };

  // Delete
  const deleteBanner = async (id) => {
    if (!window.confirm("Delete banner?")) return;

    try {
      await axios.delete(`${API}/api/banner/delete/${id}`);
      loadBanners();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="banner-manager">

      <h2>{editId ? "Edit Banner" : "Add New Banner"}</h2>

      <form className="banner-form" onSubmit={handleSubmit}>

        {/* TITLE */}
        <input
          type="text"
          placeholder="Banner Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* PROJECT DROPDOWN */}
        <select value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="aspirebrandstore">Aspire Brand Store</option>
          <option value="aspirebeauty">Aspire Beauty</option>
        </select>

        {/* PLATFORM DROPDOWN */}
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="website">Website</option>
          <option value="mobile">Mobile</option>
        </select>

        {/* IMAGE FILE */}
        <input type="file" onChange={handleImage} />

        {preview && <img src={preview} className="preview-img" alt="preview" />}

        <button type="submit">
          {editId ? "Update Banner" : "Add Banner"}
        </button>
      </form>

      <hr />

      <h2>All Banners</h2>

      <div className="banner-list">
        {banners.map((b) => (
          <div className="banner-card" key={b.id}>

            <img
              src={getBannerImageUrl(b.bannerImage)}
              className="list-img"
              alt="banner"
            />


            <h4>{b.title}</h4>
            <p><b>Project:</b> {b.project}</p>
            <p><b>Platform:</b> {b.platform}</p>

            <div className="actions">
              <button className="edit-btn" onClick={() => editBanner(b)}>
                Edit
              </button>

              <button className="delete-btn" onClick={() => deleteBanner(b.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

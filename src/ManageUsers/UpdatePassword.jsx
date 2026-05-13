import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./UpdatePassword.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function UpdatePassword() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShow = (field) => {
    setShow({ ...show, [field]: !show[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return setError("Passwords do not match ❌");
    }

    try {
      const token = localStorage.getItem("token");

      if (id) {
        // ADMIN
        await axios.put(
          `${BASE_URL}/api/auth/update-password/${id}`,
          { password: formData.newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // USER
        await axios.put(
          `${BASE_URL}/api/auth/update-my-password`,
          {
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      alert("Password updated successfully ✅");
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Update failed ❌");
    }
  };

  return (
    <div className="update-container">
      <h2>{id ? "Admin Update Password" : "Change My Password"}</h2>

      <form onSubmit={handleSubmit}>

        {/* OLD PASSWORD */}
        {!id && (
          <div className="password-field">
            <input
              type={show.old ? "text" : "password"}
              name="oldPassword"
              placeholder="Old Password"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
            <span onClick={() => toggleShow("old")}>
              {show.old ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        {/* NEW PASSWORD */}
        <div className="password-field">
          <input
            type={show.new ? "text" : "password"}
            name="newPassword"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
          <span onClick={() => toggleShow("new")}>
            {show.new ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="password-field">
          <input
            type={show.confirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <span onClick={() => toggleShow("confirm")}>
            {show.confirm ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="button-group">
          <button type="submit">
            {id ? "Update Password" : "Change Password"}
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/manage-user")}
          >
            Back
          </button>
        </div>

      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UpdatePassword.css";

const BASE_URL = "http://localhost:4000/api";

export default function UpdatePassword() {

  const navigate = useNavigate(); //  FIXED (inside component)

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");
  setError("");

  try {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `${BASE_URL}/auth/update-password`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    //  Show popup
    alert("Password updated successfully");

    //  Navigate after clicking OK
    navigate("/dashboard");

  } catch (err) {
    setError(err.response?.data?.message || "Something went wrong");
  }
};

  return (
  <div className="update-container">
    <h2>Update Password</h2>

    <form className="update-form" onSubmit={handleSubmit}>
      
      <input
        type="password"
        name="oldPassword"
        placeholder="Old Password"
        value={formData.oldPassword}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="newPassword"
        placeholder="New Password"
        value={formData.newPassword}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />

      <button type="submit">Update Password</button>
    </form>

    {message && <p className="success">{message}</p>}
    {error && <p className="error">{error}</p>}
  </div>
);
}
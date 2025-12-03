import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import Avatar from "../assets/SplashScreen.png";
import "./Topbar.css";

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="topbar">
      <div>
        <h2>Hello {user?.name || "Admin"},</h2>
        <p>Here you can manage your stores.</p>
      </div>

      <div className="admin-info">
        <img src={Avatar} alt="Admin" className="admin-avatar" />
        <div>
          <h4>{user?.name || "Admin"}</h4>
          <p>{user?.email || "admin@gmail.com"}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

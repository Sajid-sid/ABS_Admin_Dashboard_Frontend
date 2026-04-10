import React, { useState } from "react";
import "../pages/Dashboard.css";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import {
  FaBars,
  FaBoxOpen,
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaWarehouse
} from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import FontSelector from "../components/FontSelector";


export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [orderMenuOpen, setOrderMenuOpen] = useState(false);
  const [stockMenuOpen, setStockMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [showTypography, setShowTypography] = useState(false);


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <h1 className="logo">{!collapsed && <span>My Dashboard</span>}</h1>
        <button
          className="menu-btn"
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle Menu"
        >
          <FaBars />
        </button>
      </div>

      <nav>
        <Link to="/dashboard" className="nav-item active">
          🏠 {!collapsed && "Dashboard"}
        </Link>

        {/* ---- Products Menu ---- */}
        <div className="nav-item product-menu">
          <div
            className="nav-item-header"
            onClick={() => setProductMenuOpen(!productMenuOpen)}
          >
            <FaBoxOpen />
            {!collapsed && (
              <>
                <span className="menu-title">Products</span>
                {productMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
              </>
            )}
          </div>

          {!collapsed && productMenuOpen && (
            <div className="submenu">
              <Link to="/add-product" className="submenu-item">🛍️ Collections</Link>
              <Link to="/category" className="submenu-item">🗂️ Add Category</Link>
              <Link to="/sub-category" className="submenu-item">🏷️ Add Product</Link>
            </div>
          )}
        </div>

        {/* ⭐ NEW — STOCK DROPDOWN (REPLACES OLD StockInformation LINK) */}
        <div className="nav-item stock-menu">
          <div
            className="nav-item-header"
            onClick={() => setStockMenuOpen(!stockMenuOpen)}
          >
            <FaWarehouse />
            {!collapsed && (
              <>
                <span className="menu-title">Stock</span>
                {stockMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
              </>
            )}
          </div>

          {!collapsed && stockMenuOpen && (
            <div className="submenu">
              <Link to="/stock-information" className="submenu-item">📦 Stock Information</Link>

            </div>
          )}
        </div>

        {/* ---- Order Summary Menu ---- */}
        <div className="nav-item order-menu">
          <div
            className="nav-item-header"
            onClick={() => setOrderMenuOpen(!orderMenuOpen)}
          >
            <FaShoppingCart />
            {!collapsed && (
              <>
                <span className="menu-title">Order Summary</span>
                {orderMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
              </>
            )}
          </div>

          {!collapsed && orderMenuOpen && (
            <div className="submenu">
              <Link to="/orders" className="submenu-item">📋 All Orders</Link>
              <Link to="/orders/pending" className="submenu-item">⏳ Pending Orders</Link>
              <Link to="/orders/confirmed" className="submenu-item">📦 Confirmed</Link>
              <Link to="/orders/shipped" className="submenu-item">🚚 Shipped</Link>
              <Link to="/orders/delivered" className="submenu-item">✅ Delivered</Link>
              <Link to="/orders/cancelled" className="submenu-item">❌ Cancelled</Link>
            </div>
          )}
        </div>
        <Link to="/banner" className="nav-item">
          🖼️ {!collapsed && "Banner"}
        </Link>
        <Link to="/coupons" className="nav-item">
          🎟️ {!collapsed && "Coupons"}
        </Link>

        <Link to="/site-settings" className="nav-item">
          ⚙️ {!collapsed && "Site Settings"}
        </Link>

         <Link to="/theme-options" className="nav-item">
          🛒 {!collapsed && "Store Settings"}
        </Link>

        <Link to="/ad-videos" className="nav-item">
          <FaVideo /> {!collapsed && "Ad Videos"}
        </Link>

        {/* ---- Settings Menu ---- */}
        <div className="nav-item settings-menu">
          <div
            className="nav-item-header"
            onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
          >
            ⚙️
            {!collapsed && (
              <>
                <span className="menu-title">Settings</span>
                {settingsMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
              </>
            )}
          </div>

          {!collapsed && settingsMenuOpen && (
            <div className="submenu">

            <Link to="/update-my-password" className="submenu-item">
                👤 Update password
              </Link>

                <Link to="/manage-user" className="submenu-item">
                👤 ManageUser
              </Link>


             

            </div>
          )}
        </div>


        <button onClick={handleLogout} className="nav-item">
          🚪 {!collapsed && "Logout"}
        </button>

      </nav>
    </div>
  );
}

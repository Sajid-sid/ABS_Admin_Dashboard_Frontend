import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [counts, setCounts] = useState({
    Pending: 0,
    Confirmed: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
  });

  const [productCounts, setProductCounts] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("📡 Fetching orders:", `${API_BASE}/api/orders`);

      const res = await fetch(`${API_BASE}/api/orders`);
      const json = await res.json();

      if (!json.success) {
        console.log("❌ API returned success:false");
        return;
      }

      const orders = json.orders || [];
      console.log("📦 Orders received:", orders.length);

      // -------------------------------
      // ORDER STATUS COUNT
      // -------------------------------
      const grouped = {
        Pending: orders.filter((o) => o.orderStatus === "Pending").length,
        Confirmed: orders.filter((o) => o.orderStatus === "Confirmed").length,
        Shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
        Delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
        Cancelled: orders.filter((o) => o.orderStatus === "Cancelled").length,
      };

      setCounts(grouped);

      // -------------------------------
      // PRODUCT-WISE COUNTS
      // -------------------------------
      const productMap = {};

      orders.forEach((order) => {
        console.log("Status:", order.orderStatus);
        console.log("Items:", order.items);

        if (Array.isArray(order.items) && order.items.length > 0) {
          order.items.forEach((item, index) => {
            console.log(`   🔹 ITEM ${index + 1}`);
            console.log("      Product Name:", item.productName);
            console.log("      Price:", item.price);
            console.log("      Quantity:", item.quantity);

            const name = item.productName || "Unknown Product";

            if (!productMap[name]) {
              productMap[name] = 0;
            }
            productMap[name] += item.quantity;
          });
        }
      });

      console.log("📊 FINAL PRODUCT MAP:", productMap);

      setProductCounts(productMap);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
    }
  };

  const goTo = (url) => navigate(url);

  return (
    <div className="dashboard">
      <div className="main">
        <div className="content">
          <h2 className="overview-title">
            Welcome {user ? user.name || user.email : "Admin"}
          </h2>

          <div className="status-section">

            <div className="status-box status-all" onClick={() => goTo("/orders")}>
              All Orders
              <span className="status-count">
                {counts.Pending +
                  counts.Confirmed +
                  counts.Shipped +
                  counts.Delivered +
                  counts.Cancelled}
              </span>
            </div>

            <div className="status-box status-waiting" onClick={() => goTo("/orders/pending")}>
              Waiting for Acceptance
              <span className="status-count">{counts.Pending}</span>
            </div>

            <div className="status-box status-confirmed" onClick={() => goTo("/orders/confirmed")}>
              Booking Confirmed
              <span className="status-count">{counts.Confirmed}</span>
            </div>

            <div className="status-box status-shipped" onClick={() => goTo("/orders/shipped")}>
              Shipped
              <span className="status-count">{counts.Shipped}</span>
            </div>

            <div className="status-box status-completed" onClick={() => goTo("/orders/delivered")}>
              Completed
              <span className="status-count">{counts.Delivered}</span>
            </div>

            <div className="status-box status-cancelled" onClick={() => goTo("/orders/cancelled")}>
              Cancelled
              <span className="status-count">{counts.Cancelled}</span>
            </div>
          </div>

          {/* PRODUCT WISE COUNT */}
          <div className="status-section">
            <h3 style={{ width: "100%" }}>Product Wise Order Count</h3>

            {Object.entries(productCounts).map(([name, qty]) => (
              <div className="status-box status-product" key={name}>
                {name}
                <span className="status-count">{qty}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

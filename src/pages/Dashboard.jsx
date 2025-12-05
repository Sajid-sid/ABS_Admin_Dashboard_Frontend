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

  useEffect(() => {
    fetchOrderCounts();
  }, []);

  const fetchOrderCounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      const json = await res.json();

      if (!json.success) return;

      const allOrders = json.orders || [];

      const grouped = {
        Pending: allOrders.filter(o => o.orderStatus === "Pending").length,
        Confirmed: allOrders.filter(o => o.orderStatus === "Confirmed").length,
        Shipped: allOrders.filter(o => o.orderStatus === "Shipped").length,
        Delivered: allOrders.filter(o => o.orderStatus === "Delivered").length,
        Cancelled: allOrders.filter(o => o.orderStatus === "Cancelled").length,
      };

      setCounts(grouped);
    } catch (err) {
      console.error("Failed to fetch counts", err);
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

            {/* ALL ORDERS */}
            <div className="status-box status-all" onClick={() => goTo("/orders")}>
              All Orders
              <span className="status-count">
                {counts.Pending + counts.Confirmed + counts.Shipped + counts.Delivered + counts.Cancelled}
              </span>
            </div>

            {/* PENDING */}
            <div className="status-box status-waiting" onClick={() => goTo("/orders/pending")}>
              Waiting for Acceptance
              <span className="status-count">{counts.Pending}</span>
            </div>

            {/* CONFIRMED */}
            <div className="status-box status-confirmed" onClick={() => goTo("/orders/confirmed")}>
              Booking Confirmed
              <span className="status-count">{counts.Confirmed}</span>
            </div>

            {/* SHIPPED */}
            <div className="status-box status-shipped" onClick={() => goTo("/orders/shipped")}>
              Shipped
              <span className="status-count">{counts.Shipped}</span>
            </div>

            {/* DELIVERED */}
            <div className="status-box status-completed" onClick={() => goTo("/orders/delivered")}>
              Completed
              <span className="status-count">{counts.Delivered}</span>
            </div>

            {/* CANCELLED */}
            <div className="status-box status-cancelled" onClick={() => goTo("/orders/cancelled")}>
              Cancelled
              <span className="status-count">{counts.Cancelled}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

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
      const res = await fetch(`${API_BASE}/api/orders`);
      const json = await res.json();
      if (!json.success) return;

      const orders = json.orders || [];

      // ------------------------------------
      // ITEM STATUS COUNT
      // ------------------------------------
      const itemStatusCount = {
        Pending: 0,
        Confirmed: 0,
        Shipped: 0,
        Delivered: 0,
        Cancelled: 0,
      };

      const productMap = {};

      orders.forEach((order) => {
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const status = item.itemStatus || "Pending";
            const qty = Number(item.quantity) || 0;

            // Count by itemStatus
            if (itemStatusCount[status] !== undefined) {
              itemStatusCount[status] += qty;
            }

            // Product-wise count
            const pid = item.productId;
            if (!productMap[pid]) {
              productMap[pid] = { name: item.productName, quantity: 0 };
            }
            productMap[pid].quantity += qty;
          });
        }
      });

      setCounts(itemStatusCount);
      setProductCounts(productMap);
    } catch (err) {
      console.error("❌ Error:", err);
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

          {/* STATUS BOXES */}
          <div className="status-section">
            <div className="status-box status-all" onClick={() => goTo("/orders")}>
              All Items
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
            <h3 style={{ width: "100%" }}>Product Wise Item Count</h3>

            {Object.entries(productCounts).map(([pid, data]) => (
              <div className="status-box status-product" key={pid}>
                {data.name}
                <span className="status-count">{data.quantity}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

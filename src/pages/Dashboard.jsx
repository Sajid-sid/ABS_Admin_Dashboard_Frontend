import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_API_URL;

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
  const [subCategoryCount, setSubCategoryCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    fetchOrders();
    fetchSubCategoryCount();
     fetchCategoryCount();
    
  }, []);

  // ----------------------------
  // FETCH ORDER DATA
  // ----------------------------
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      const json = await res.json();
      if (!json.success) return;

      const orders = json.orders || [];

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

            if (itemStatusCount[status] !== undefined) {
              itemStatusCount[status] += qty;
            }

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
      console.error("Error fetching orders:", err);
    }
  };

  // ----------------------------
  // FETCH TOTAL SUBCATEGORY COUNT
  // ----------------------------
  const fetchSubCategoryCount = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/subcategories/count`);
      const data = await res.json();

      if (data.success) {
        setSubCategoryCount(data.total);
      }
    } catch (error) {
      console.error("Error fetching subcategory count:", error);
    }
  };

  // ----------------------------
  // FETCH CATEGORY COUNT
  // ----------------------------
  const fetchCategoryCount = async (category) =>  {
  try {
    const res = await fetch(
      `${API_BASE}/api/subcategories/count/product-categories`
    );
    const data = await res.json();

    if (data.success) {
      setCategoryCount(data.total); // 👈 important
    }
  } catch (error) {
    console.error("Error fetching category count:", error);
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

          {/* ORDER STATUS SECTION */}
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

            <div className="status-box status-waiting">
              Waiting
              <span className="status-count">{counts.Pending}</span>
            </div>

            <div className="status-box status-confirmed">
              Confirmed
              <span className="status-count">{counts.Confirmed}</span>
            </div>

            <div className="status-box status-shipped">
              Shipped
              <span className="status-count">{counts.Shipped}</span>
            </div>

            <div className="status-box status-completed">
              Delivered
              <span className="status-count">{counts.Delivered}</span>
            </div>

            <div className="status-box status-cancelled">
              Cancelled
              <span className="status-count">{counts.Cancelled}</span>
            </div>
          </div>

          {/* DATABASE PRODUCT STATS */}
          <div className="status-section">
            <h3 style={{ width: "100%" }}>Product Database Stats</h3>

            <div className="status-box status-product">
              Total Products
              <span className="status-count">{subCategoryCount}</span>
            </div>
            <div className="status-box status-product">
              Total Category
              <span className="status-count">{categoryCount}</span>
            </div>
          </div>

          {/* PRODUCT WISE ORDER COUNT */}
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
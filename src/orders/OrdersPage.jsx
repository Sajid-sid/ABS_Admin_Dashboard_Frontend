// src/pages/OrdersPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./OrdersPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Confirmed: "#0ea5e9",
  Shipped: "#7c3aed",
  Delivered: "#10b981",
  Cancelled: "#ef4444",
};

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#6b7280";
  return <span className="status-badge" style={{ backgroundColor: color }}>{status}</span>;
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const { status } = useParams(); // dynamic status param (pending, delivered, etc.)
  const routeStatus = (status || "all").toLowerCase();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI controls
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setPage(1); // reset page when route/status changes or search
  }, [routeStatus, search, pageSize]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      const json = await res.json();
      if (json && json.success) setOrders(Array.isArray(json.orders) ? json.orders : []);
      else setOrders(Array.isArray(json.orders) ? json.orders : []);
    } catch (err) {
      console.error("Fetch orders failed", err);
      alert("Failed to fetch orders from server");
    } finally {
      setLoading(false);
    }
  }

  // filter by routeStatus and search
  const filtered = useMemo(() => {
    let list = Array.isArray(orders) ? [...orders] : [];
    if (routeStatus !== "all") {
      // routeStatus may be e.g. 'pending' -> compare case-insensitive with orderStatus
      list = list.filter(o => (o.orderStatus || "").toLowerCase() === routeStatus);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o => (`${o.id} ${o.fullName} ${o.phone}`).toLowerCase().includes(q));
    }
    return list;
  }, [orders, routeStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetails = (order) => { setSelectedOrder(order); setShowDetails(true); };
  const closeDetails = () => { setSelectedOrder(null); setShowDetails(false); };

  const updateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const j = await res.json();
      if (j.success) {
        // update local orders
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(s => ({ ...s, orderStatus: newStatus }));
      } else {
        alert(j.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update status failed", err);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="orders-page theme-b">
      <div className="orders-header">
        <h1>Order Summary {routeStatus !== "all" ? `— ${routeStatus.toUpperCase()}` : ""}</h1>
        <div className="controls">
          <input
            className="search-input"
            placeholder="Search by order id, name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            <option value={8}>8 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
          <button className="btn gold" onClick={fetchOrders}>Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading orders…</div>
      ) : (
        <>
          <div className="orders-table">
            <div className="orders-row head">
              <div>#</div>
              <div>Customer</div>
              <div>Items</div>
              <div>Total</div>
              <div>Status</div>
              <div>Date</div>
              <div>Actions</div>
            </div>

            {paginated.length === 0 ? (
              <div className="empty">No orders found.</div>
            ) : paginated.map(o => (
              <div className="orders-row" key={o.id}>
                <div className="col-id">#{o.id}</div>
                <div className="col-cust">
                  <div className="cust-name">{o.fullName}</div>
                  <div className="cust-phone">{o.phone}</div>
                  <div className="cust-address">{o.address}</div>
                </div>
                <div className="col-items">{(o.items?.length ?? 0)}</div>
                <div className="col-total">₹{Number(o.totalAmount).toFixed(2)}</div>
                <div className="col-status"><StatusBadge status={o.orderStatus} /></div>
                <div className="col-date">{new Date(o.createdAt).toLocaleString()}</div>
                <div className="col-actions">
                  <button className="btn dark" onClick={() => openDetails(o)}>View</button>
                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    disabled={updatingStatus}
                    className="status-select"
                  >
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="orders-footer">
            <div className="pagination">
              <button onClick={() => setPage(1)} disabled={page === 1} className="page-btn">« First</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn">‹ Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn">Next ›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="page-btn">Last »</button>
            </div>
            <div className="summary">Showing {paginated.length} of {filtered.length} results</div>
          </div>
        </>
      )}

      {showDetails && selectedOrder && (
        <div className="modal-backdrop" onClick={closeDetails}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={closeDetails}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div>
                  <strong>Customer</strong>
                  <div>{selectedOrder.fullName}</div>
                  <div>{selectedOrder.phone}</div>
                  <div style={{ marginTop: 6 }}>{selectedOrder.address}, {selectedOrder.city} - {selectedOrder.pincode}</div>
                </div>
                <div>
                  <strong>Order Info</strong>
                  <div>Total: ₹{Number(selectedOrder.totalAmount).toFixed(2)}</div>
                  <div>Items: {selectedOrder.items?.length ?? 0}</div>
                  <div>Status: <StatusBadge status={selectedOrder.orderStatus} /></div>
                </div>
                <div>
                  <strong>Placed</strong>
                  <div>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <hr />

              <div className="items-list">
                {selectedOrder.items?.map(it => (
                  <div key={it.id} className="order-item">
                    <img src={it.imageUrl} alt={it.productName} />
                    <div className="item-info">
                      <div className="item-name">{it.productName}</div>
                      <div className="item-meta">Qty: {it.quantity} • ₹{it.price}</div>
                    </div>
                    <div className="item-total">₹{(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <label>Change Status:</label>
              <select
                value={selectedOrder.orderStatus}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  await updateStatus(selectedOrder.id, newStatus);
                  setSelectedOrder(s => ({ ...s, orderStatus: newStatus }));
                  setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, orderStatus: newStatus } : o));
                }}
              >
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
              <button className="btn close" onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

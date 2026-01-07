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
  const { status } = useParams();
  const routeStatus = (status || "all").toLowerCase();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [stockMap, setStockMap] = useState({});
  const [bookingCountsMap, setBookingCountsMap] = useState({});
  const [itemStatuses, setItemStatuses] = useState({}); // Track each item's status in modal

  // Fetch all orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [routeStatus, search, pageSize]);

  // Fetch stocks and booking counts
  useEffect(() => {
    const loadStocks = async () => {
      const stocks = await fetchStockCounts();
      const bookings = await fetchBookingCounts();
      setStockMap(stocks);
      setBookingCountsMap(bookings);
    };
    loadStocks();
  }, []);

  /** Fetch orders */
  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      const json = await res.json();
      if (json && json.success) setOrders(Array.isArray(json.orders) ? json.orders : []);
      else setOrders([]);
    } catch (err) {
      console.error("Fetch orders failed", err);
      alert("Failed to fetch orders from server");
    } finally {
      setLoading(false);
    }
  }

  /** Fetch all stock data */
  const fetchStockCounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/stock/getStocks`);
      const json = await res.json();
      if (!json.success) return {};

      const map = {};
      (json.data || []).forEach(item => {
        if (item.productName) map[item.productName.toLowerCase()] = Number(item.stock) || 0;
      });
      return map;
    } catch (err) {
      console.error("Fetch stock counts failed", err);
      return {};
    }
  };

  /** Fetch total confirmed/pending per product */
  const fetchBookingCounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      const json = await res.json();
      if (!json.success) return {};

      const map = {};
      (json.orders || []).forEach(order => {
        if (!Array.isArray(order.items)) return;
        order.items.forEach(item => {
          const name = item.productName?.toLowerCase();
          if (!name) return;
          if (!map[name]) map[name] = { confirmed: 0, pending: 0 };
          if (order.orderStatus === "Confirmed") map[name].confirmed += item.quantity;
          else if (order.orderStatus === "Pending") map[name].pending += item.quantity;
        });
      });
      return map;
    } catch (err) {
      console.error("Fetch booking counts failed", err);
      return {};
    }
  };

  /** Check if order can be confirmed */
  const canConfirmOrder = (order) => {
    for (const item of order.items || []) {
      const key = item.productName?.toLowerCase();
      const totalStock = stockMap[key] || 0;
      const bookings = bookingCountsMap[key] || { confirmed: 0, pending: 0 };
      const productLeft = totalStock - (bookings.confirmed + bookings.pending);
      if (item.quantity > productLeft) return false;
    }
    return true;
  };

  /** Update order status */
  const updateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (newStatus === "Confirmed" && !canConfirmOrder(order)) {
      alert("Cannot confirm: insufficient stock for one or more items!");
      return;
    }
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
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
        if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(s => ({ ...s, orderStatus: newStatus }));
      } else alert(j.message || "Failed to update status");
    } catch (err) {
      console.error("Update status failed", err);
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter orders by routeStatus and search
  const filtered = useMemo(() => {
    let list = Array.isArray(orders) ? [...orders] : [];
    if (routeStatus !== "all") list = list.filter(o => (o.orderStatus || "").toLowerCase() === routeStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o => (`${o.id} ${o.fullName} ${o.phone}`).toLowerCase().includes(q));
    }
    return list;
  }, [orders, routeStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openDetails = (order) => {
    setSelectedOrder(order);

    const statuses = {};
    order.items?.forEach(it => {
      statuses[it.id] = it.itemStatus || "Pending";   
    });

    setItemStatuses(statuses);
    setShowDetails(true);
  };

  const closeDetails = () => { setSelectedOrder(null); setShowDetails(false); };

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

      {loading ? <div className="loading">Loading orders…</div> : (
        <>
          <div className="orders-table">
            <div className="orders-row head">
              <div>#</div>
              <div>Customer</div>
              <div>Items</div>
              <div>Total</div>
              <div>Payment Status</div>
              <div>Payment Method</div>
              <div>Order Status</div>
              <div>Date</div>
              <div>Actions</div>
            </div>
            {paginated.length === 0 ? <div className="empty">No orders found.</div> :
              paginated.map(o => (
                <div className="orders-row" key={o.id}>
                  <div className="col-id">#{o.id}</div>
                  <div className="col-cust">
                    <div className="cust-name">{o.fullName}</div>
                    <div className="cust-phone">{o.phone}</div>
                    <div className="cust-address">{o.address}</div>
                  </div>
                  <div className="col-items">{o.items?.length ?? 0}</div>
                  <div className="col-total">₹{Number(o.totalAmount).toFixed(2)}</div>
                  <div className="col-payment-status">

                    <span
                      className={`payment-badge ${o.paymentStatus === "Paid"
                        ? "payment-paid"
                        : o.paymentStatus === "Pending"
                          ? "payment-pending"
                          : o.paymentStatus === "Failed"
                            ? "payment-failed"
                            : "payment-refunded"
                        }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </div>

                  <div className="col-payment-method">
                    <span className="payment-method">{o.paymentMethod}</span>
                  </div>

                    <div className="col-status">
                    {
                      (() => {
                        const statuses = o.items?.map(i => i.itemStatus) || [];
                        const unique = [...new Set(statuses)];

                        if (unique.length === 1) {
                          return <StatusBadge status={unique[0]} />;
                        } else {
                          return <StatusBadge status="Mixed" />;
                        }
                      })()
                    }
                  </div>


                  <div className="col-date">{new Date(o.createdAt).toLocaleString()}</div>
                  <div className="col-actions">
                    <button className="btn dark" onClick={() => openDetails(o)}>View</button>
                  </div>
                </div>
              ))
            }
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
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
              <div>
                <div>Payment Status: {selectedOrder.paymentStatus}</div>
                <div>Payment Method: {selectedOrder.paymentMethod}</div>
              </div>


              <hr />

              <div className="items-list">
                {selectedOrder.items?.map(it => {
                  const key = it.productName?.toLowerCase();
                  const totalStock = stockMap[key] || 0;
                  const bookings = bookingCountsMap[key] || { confirmed: 0, pending: 0 };
                  const productLeft = Math.max(0, totalStock - (bookings.confirmed + bookings.pending));
                  const itemStatus = itemStatuses[it.id];

                  return (
                    <div key={it.id} className="order-item">
                      <img src={it.imageUrl} alt={it.productName} />
                      <div className="item-info">
                        <div className="item-name">{it.productName}</div>
                        <div className="item-meta">
                          Qty: {it.quantity} • ₹{it.price} • Available: {productLeft}
                        </div>
                      </div>
                      <div className="item-status">
                        <select
                          value={itemStatus}
                          onChange={(e) => setItemStatuses(prev => ({ ...prev, [it.id]: e.target.value }))}
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="modal-footer">
                <button className="btn gold" onClick={async () => {
                  for (const it of selectedOrder.items) {
                    const newStatus = itemStatuses[it.id];
                    if (!newStatus) continue;
                    if (newStatus === "Confirmed" && it.quantity > (stockMap[it.productName.toLowerCase()] || 0)) {
                      alert(`Cannot confirm: insufficient stock for ${it.productName}`);
                      continue;
                    }
                    await fetch(`${API_BASE}/api/orders/${selectedOrder.id}/items/${it.id}/status`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: newStatus }),
                    });
                  }
                  alert("All item statuses updated!");
                  fetchOrders();
                  closeDetails();
                }}>Submit</button>
                <button className="btn close" onClick={closeDetails}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

/* ─────────────── STYLES ─────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');

  :root {
    --rop-bg: #0b0c0f;
    --rop-surface: #13151a;
    --rop-surface2: #1c1f27;
    --rop-border: #252830;
    --rop-border2: #2e3240;
    --rop-text: #e8eaf0;
    --rop-muted: #6b7280;
    --rop-accent: #f0b429;
    --rop-accent2: #ff6b35;
    --rop-green: #10d98e;
    --rop-red: #ff4d6d;
    --rop-blue: #4da6ff;
    --rop-purple: #9f7aea;
    --rop-font-head: 'Syne', sans-serif;
    --rop-font-mono: 'DM Mono', monospace;
  }

  .rop-root * { box-sizing: border-box; margin: 0; padding: 0; }

  .rop-root {
    font-family: var(--rop-font-mono);
    background: var(--rop-bg);
    color: var(--rop-text);
    min-height: 100vh;
    padding: 32px 28px;
  }

  /* HEADER */
  .rop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--rop-border);
  }
  .rop-title {
    font-family: var(--rop-font-head);
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .rop-title-grad {
    background: linear-gradient(135deg, var(--rop-accent), var(--rop-accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .rop-count-badge {
    font-family: var(--rop-font-mono);
    font-size: 12px;
    background: var(--rop-surface2);
    border: 1px solid var(--rop-border2);
    color: var(--rop-muted);
    padding: 3px 10px;
    border-radius: 99px;
    -webkit-text-fill-color: var(--rop-muted);
  }
  .rop-refresh {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--rop-surface2);
    border: 1px solid var(--rop-border2);
    color: var(--rop-text);
    font-family: var(--rop-font-mono);
    font-size: 13px;
    padding: 9px 18px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .rop-refresh:hover { border-color: var(--rop-accent); color: var(--rop-accent); }

  /* TABLE */
  .rop-table {
    background: var(--rop-surface);
    border: 1px solid var(--rop-border);
    border-radius: 14px;
    overflow: hidden;
  }
  .rop-thead {
    display: grid;
    grid-template-columns: 80px 1fr 110px 130px 105px 140px;
    gap: 12px;
    padding: 13px 20px;
    background: var(--rop-surface2);
    border-bottom: 1px solid var(--rop-border);
    font-size: 11px;
    color: var(--rop-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
  }
  .rop-row {
    display: grid;
    grid-template-columns: 80px 1fr 110px 130px 105px 140px;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--rop-border);
    align-items: center;
    transition: background 0.15s;
    cursor: pointer;
  }
  .rop-row:last-child { border-bottom: none; }
  .rop-row:hover { background: var(--rop-surface2); }

  .rop-order-id {
    font-family: var(--rop-font-mono);
    font-size: 13px;
    color: var(--rop-accent);
    font-weight: 500;
  }
  .rop-customer-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--rop-text);
    font-family: var(--rop-font-head);
  }
  .rop-customer-phone {
    font-size: 12px;
    color: var(--rop-muted);
    margin-top: 2px;
    font-family: var(--rop-font-mono);
  }
  .rop-amount {
    font-family: var(--rop-font-mono);
    font-size: 14px;
    font-weight: 500;
  }
  .rop-date {
    font-size: 12px;
    color: var(--rop-muted);
    font-family: var(--rop-font-mono);
  }

  /* BADGE */
  .rop-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
    font-family: var(--rop-font-mono);
    border: 1px solid transparent;
  }
  .rop-badge::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  /* VIEW BTN */
  .rop-view-btn {
    background: transparent;
    border: 1px solid var(--rop-border2);
    color: var(--rop-muted);
    font-family: var(--rop-font-mono);
    font-size: 12px;
    padding: 7px 14px;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .rop-view-btn:hover { border-color: var(--rop-accent); color: var(--rop-accent); }

  /* EMPTY / LOADING */
  .rop-empty {
    padding: 60px 20px;
    text-align: center;
    color: var(--rop-muted);
    font-size: 14px;
  }
  .rop-loading {
    padding: 60px 20px;
    text-align: center;
    color: var(--rop-muted);
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .rop-spinner {
    width: 16px; height: 16px;
    border: 2px solid var(--rop-border2);
    border-top-color: var(--rop-accent);
    border-radius: 50%;
    animation: rop-spin 0.7s linear infinite;
  }
  @keyframes rop-spin { to { transform: rotate(360deg); } }

  /* PAGINATION */
  .rop-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin-top: 24px;
  }
  .rop-page-btn {
    background: var(--rop-surface);
    border: 1px solid var(--rop-border2);
    color: var(--rop-muted);
    font-family: var(--rop-font-mono);
    font-size: 12px;
    padding: 7px 13px;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.18s;
  }
  .rop-page-btn:hover:not(:disabled) { border-color: var(--rop-accent); color: var(--rop-accent); }
  .rop-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .rop-page-info { font-size: 12px; color: var(--rop-muted); padding: 0 8px; }

  /* MODAL */
  .rop-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.72);
    backdrop-filter: blur(6px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: rop-fadeIn 0.18s ease;
  }
  @keyframes rop-fadeIn { from { opacity: 0 } to { opacity: 1 } }

  .rop-modal {
    background: var(--rop-surface);
    border: 1px solid var(--rop-border2);
    border-radius: 18px;
    width: 100%; max-width: 720px; max-height: 88vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: rop-slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes rop-slideUp {
    from { transform: translateY(24px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .rop-modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 18px;
    border-bottom: 1px solid var(--rop-border);
    flex-shrink: 0;
  }
  .rop-modal-title {
    font-family: var(--rop-font-head);
    font-size: 18px; font-weight: 700;
    display: flex; align-items: center; gap: 10px;
  }
  .rop-close-btn {
    width: 32px; height: 32px;
    background: var(--rop-surface2);
    border: 1px solid var(--rop-border2);
    color: var(--rop-muted);
    border-radius: 50%; cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s;
  }
  .rop-close-btn:hover { color: var(--rop-text); }

  .rop-modal-body {
    overflow-y: auto;
    padding: 22px 24px;
    display: flex; flex-direction: column; gap: 20px;
  }

  /* INFO GRID */
  .rop-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .rop-info-card {
    background: var(--rop-surface2);
    border: 1px solid var(--rop-border);
    border-radius: 11px;
    padding: 14px 16px;
    display: flex; flex-direction: column; gap: 5px;
  }
  .rop-info-card.full { grid-column: span 2; }
  .rop-info-label {
    font-size: 10px; color: var(--rop-muted);
    text-transform: uppercase; letter-spacing: 1px;
    font-weight: 500; margin-bottom: 3px;
  }
  .rop-info-val { font-size: 13px; color: var(--rop-text); line-height: 1.5; }
  .rop-info-val.mono { font-family: var(--rop-font-mono); }
  .rop-info-val.sm   { font-size: 12px; color: var(--rop-muted); }

  .rop-pricing-row {
    display: flex; justify-content: space-between;
    font-size: 13px; color: var(--rop-muted);
    padding: 3px 0;
  }
  .rop-pricing-row.discount { color: var(--rop-green); }
  .rop-pricing-row.coupon   { color: var(--rop-blue); }
  .rop-pricing-row.final {
    color: var(--rop-text); font-weight: 600;
    margin-top: 6px; padding-top: 8px;
    border-top: 1px solid var(--rop-border);
  }

  .rop-divider { border: none; border-top: 1px solid var(--rop-border); }

  .rop-section-label {
    font-size: 10px; color: var(--rop-muted);
    text-transform: uppercase; letter-spacing: 1px; font-weight: 500;
  }

  /* ITEMS */
  .rop-item {
    display: flex; gap: 14px;
    background: var(--rop-surface2);
    border: 1px solid var(--rop-border);
    border-radius: 12px; padding: 14px;
    align-items: flex-start;
    transition: border-color 0.18s;
  }
  .rop-item.has-return { border-color: #f0b42940; }
  .rop-item-img {
    width: 68px; height: 68px;
    object-fit: cover; border-radius: 9px;
    background: var(--rop-bg);
    border: 1px solid var(--rop-border2);
    flex-shrink: 0;
  }
  .rop-item-img-placeholder {
    width: 68px; height: 68px;
    border-radius: 9px; background: var(--rop-bg);
    border: 1px solid var(--rop-border2);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; flex-shrink: 0; color: var(--rop-muted);
  }
  .rop-item-main { flex: 1; display: flex; flex-direction: column; gap: 6px; }
  .rop-item-name {
    font-family: var(--rop-font-head);
    font-size: 14px; font-weight: 600; color: var(--rop-text);
  }
  .rop-item-meta {
    font-size: 12px; color: var(--rop-muted);
    font-family: var(--rop-font-mono);
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  }
  .rop-item-meta .sep { opacity: 0.3; }

  .rop-return-box {
    margin-top: 6px;
    background: #f0b42910;
    border: 1px solid #f0b42930;
    border-radius: 9px; padding: 10px 12px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .rop-return-tag {
    font-size: 10px; color: var(--rop-accent);
    text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
  }
  .rop-return-reason {
    font-size: 12px; color: var(--rop-muted); line-height: 1.5;
  }
  .rop-return-video { font-size: 11px; display: flex; align-items: center; gap: 5px; }
  .rop-return-video a { color: var(--rop-blue); text-decoration: none; }
  .rop-return-video a:hover { text-decoration: underline; }


  .rop-approve-btn {
    background: linear-gradient(135deg, #10d98e20, #10d98e10);
    border: 1px solid #10d98e40;
    color: var(--rop-green);
    font-family: var(--rop-font-mono);
    font-size: 12px; padding: 8px 14px;
    border-radius: 8px; cursor: pointer;
    transition: all 0.18s; white-space: nowrap;
  }
  .rop-approve-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #10d98e40, #10d98e20);
    border-color: var(--rop-green);
  }
  .rop-approve-btn:disabled { opacity: 0.28; cursor: not-allowed; }
`;

/* ─────────────── STATUS CONFIG ─────────────── */
const STATUS_CONFIG = {
  Pending: { bg: "#f0b42918", color: "#f0b429", border: "#f0b42940" },
  Confirmed: { bg: "#4da6ff18", color: "#4da6ff", border: "#4da6ff40" },
  Shipped: { bg: "#9f7aea18", color: "#9f7aea", border: "#9f7aea40" },
  Delivered: { bg: "#10d98e18", color: "#10d98e", border: "#10d98e40" },
  Cancelled: { bg: "#ff4d6d18", color: "#ff4d6d", border: "#ff4d6d40" },
  Approved: { bg: "#10d98e18", color: "#10d98e", border: "#10d98e40" },
  Rejected: { bg: "#ff4d6d18", color: "#ff4d6d", border: "#ff4d6d40" },
  Paid: { bg: "#10d98e18", color: "#10d98e", border: "#10d98e40" },
  Unpaid: { bg: "#ff4d6d18", color: "#ff4d6d", border: "#ff4d6d40" },
  COD: { bg: "#f0b42918", color: "#f0b429", border: "#f0b42940" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { bg: "#6b728018", color: "#6b7280", border: "#6b728040" };
  return (
    <span className="rop-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
      {status}
    </span>
  );
}

/* ─────────────── MAIN COMPONENT ─────────────── */
export default function ReturnOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReturns, setSelectedReturns] = useState([]);

  useEffect(() => { fetchReturnOrders(page); }, [page]);

  /* ── FETCH ── */
  const fetchReturnOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { alert("Login required"); return; }

      const res = await fetch(
        `${API_BASE}/api/returns/orders?page=${pageNum}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 401) { alert("Session expired. Login again."); return; }

      const json = await res.json();
      if (!json.success) { setOrders([]); return; }

      setOrders(json.orders || []);
      setTotalPages(json.totalPages || 1);
      setTotal(json.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleReturnSelection = (returnId) => {
    setSelectedReturns((prev) =>
      prev.includes(returnId)
        ? prev.filter((id) => id !== returnId)
        : [...prev, returnId]
    );
  };

  /* ── UPDATE RETURN STATUS (Approve / Reject) ── */
  const updateReturnStatus = async (returnId, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/returns/${returnId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");

      // Re-fetch and sync modal
      const updatedRes = await fetch(
        `${API_BASE}/api/returns/orders?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await updatedRes.json();
      if (json.success) {
        const fresh = json.orders || [];
        setOrders(fresh);
        setTotalPages(json.totalPages || 1);
        setTotal(json.total || 0);

        // Keep modal open with fresh data
        if (selectedOrder) {
          const refreshed = fresh.find(o => o.id === selectedOrder.id);
          setSelectedOrder(refreshed || null);
        }
      }
    } catch (err) {
      console.error(err);
      alert(`${status} failed`);
    }
  };

  const approveSelectedReturns = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/returns/bulk-approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            returnIds: selectedReturns,
          }),
        }
      );

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message);
      }

      alert("Returns approved successfully");

      setSelectedReturns([]);

      fetchReturnOrders(page);

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const returnCount = (order) => order.items.filter(i => i.return).length;



  return (
    <>
      <style>{css}</style>
      <div className="rop-root">

        {/* ── HEADER ── */}
        <div className="rop-header">
          <div className="rop-title">
            <span className="rop-title-grad">Return Orders</span>
            {total > 0 && <span className="rop-count-badge">{total} total</span>}
          </div>
          <button className="rop-refresh" onClick={() => fetchReturnOrders(page)}>
            ↺ Refresh
          </button>
        </div>

        {/* ── TABLE ── */}
        <div className="rop-table">
          <div className="rop-thead">
            <div>Order ID</div>
            <div>Customer</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
            <div>Action</div>
          </div>

          {loading ? (
            <div className="rop-loading"><div className="rop-spinner" /> Loading...</div>
          ) : orders.length === 0 ? (
            <div className="rop-empty">No return orders found</div>
          ) : (
            orders.map((order) => (
              <div className="rop-row" key={order.id} onClick={() => setSelectedOrder(order)}>
                <div className="rop-order-id">#{order.id}</div>
                <div>
                  <div className="rop-customer-name">{order.fullName}</div>
                  <div className="rop-customer-phone">{order.phone}</div>
                </div>
                <div className="rop-amount">₹{Number(order.finalAmount || 0).toFixed(2)}</div>
                <div><StatusBadge status={order.orderStatus} /></div>
                <div className="rop-date">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric"
                  })}
                </div>
                <div>
                  <button
                    className="rop-view-btn"
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                  >
                    View · {returnCount(order)} return{returnCount(order) !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── PAGINATION (backend-driven) ── */}
        {totalPages > 1 && (
          <div className="rop-footer">
            <button className="rop-page-btn" onClick={() => setPage(1)} disabled={page === 1}>« First</button>
            <button className="rop-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
            <span className="rop-page-info">Page {page} of {totalPages}</span>
            <button className="rop-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
            <button className="rop-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last »</button>
          </div>
        )}

        {/* ── MODAL ── */}
        {selectedOrder && (
          <div className="rop-backdrop" onClick={() => setSelectedOrder(null)}>
            <div className="rop-modal" onClick={e => e.stopPropagation()}>

              <div className="rop-modal-head">
                <div className="rop-modal-title">
                  <span className="rop-order-id">#{selectedOrder.id}</span>
                  <StatusBadge status={selectedOrder.orderStatus} />
                </div>
                <button className="rop-close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
              </div>

              <div className="rop-modal-body">
                <div className="rop-info-grid">
                  <div className="rop-info-card">
                    <div className="rop-info-label">Customer</div>
                    <div className="rop-info-val" style={{ fontFamily: "var(--rop-font-head)", fontWeight: 600 }}>
                      {selectedOrder.fullName}
                    </div>
                    <div className="rop-info-val mono">{selectedOrder.phone}</div>
                    <div className="rop-info-val sm">
                      {selectedOrder.address}, {selectedOrder.city} – {selectedOrder.pincode}
                    </div>
                  </div>

                  <div className="rop-info-card">
                    <div className="rop-info-label">Payment</div>
                    <div className="rop-info-val mono">{selectedOrder.paymentMethod}</div>
                    <StatusBadge status={selectedOrder.paymentStatus} />
                  </div>

                  <div className="rop-info-card full">
                    <div className="rop-info-label">Pricing Breakdown</div>
                    <div className="rop-pricing-row">
                      <span>Subtotal</span>
                      <span>₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    {Number(selectedOrder.discount_amount || 0) > 0 && (
                      <div className="rop-pricing-row discount">
                        <span>Discount</span>
                        <span>– ₹{Number(selectedOrder.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="rop-pricing-row coupon">
                      <span>Coupon</span>
                      <span>
                        {selectedOrder.coupon_code?.trim()
                          ? selectedOrder.coupon_code
                          : "No coupon applied"}
                      </span>
                    </div>
                    <div className="rop-pricing-row final">
                      <span>Final Amount</span>
                      <span>₹{Number(selectedOrder.finalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <hr className="rop-divider" />
                <div className="rop-section-label">Order Items ({selectedOrder.items.length})</div>

                {selectedOrder.items.map((item) => {
                  const hasReturn = !!item.return;
                  const isPending = item.return?.status === "Pending";

                  return (
                    <div key={item.id} className={`rop-item${hasReturn ? " has-return" : ""}`}>
                      {hasReturn && isPending && (
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginRight: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedReturns.includes(item.return.id)}
                            onChange={() => toggleReturnSelection(item.return.id)}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#10d98e",
                              cursor: "pointer",
                            }}
                          />
                        </label>
                      )}

                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="rop-item-img" />
                      ) : (
                        <div className="rop-item-img-placeholder">📦</div>
                      )}

                      <div className="rop-item-main">
                        <div className="rop-item-name">{item.productName}</div>
                        <div className="rop-item-meta">
                          <span>₹{Number(item.price).toFixed(2)}</span>
                          <span className="sep">·</span>
                          <span>Qty: {item.quantity}</span>
                          <span className="sep">·</span>
                          <span style={{ opacity: 0.5, fontSize: 11 }}>ID #{item.productId}</span>
                        </div>
                        <StatusBadge status={item.itemStatus} />

                        {item.return && (
                          <div className="rop-return-box">
                            <div className="rop-return-tag">↩ Return Requested</div>
                            <div className="rop-return-reason">
                              <strong style={{ color: "var(--rop-muted)", fontSize: 11 }}>Reason: </strong>
                              {item.return.reason}
                            </div>
                            {item.return.video && (
                              <div className="rop-return-video">
                                🎥 <a href={item.return.video} target="_blank" rel="noreferrer">View Video Evidence</a>
                              </div>
                            )}
                            <StatusBadge status={item.return.status} />
                          </div>
                        )}
                      </div>


                      {selectedReturns.length > 0 && (
                        <button
                          className="rop-approve-btn"
                          style={{
                            width: "100%",
                            marginTop: "16px",
                            padding: "14px",
                            fontSize: "14px",
                            fontWeight: "600"
                          }}
                          onClick={() => approveSelectedReturns()}
                        >
                          ✓ Approve Selected Returns ({selectedReturns.length})
                        </button>
                      )}
                    </div>
                  );
                })}

                {selectedReturns.length > 0 && (
                  <div
                    style={{
                      position: "sticky",
                      bottom: 0,
                      background: "#13151a",
                      borderTop: "1px solid #252830",
                      padding: "16px",
                      marginTop: "18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "14px",
                      zIndex: 20,
                    }}
                  >
                    <div
                      style={{
                        color: "#e8eaf0",
                        fontSize: "13px",
                        fontFamily: "var(--rop-font-mono)",
                      }}
                    >
                      {selectedReturns.length} return item
                      {selectedReturns.length > 1 ? "s" : ""} selected
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="rop-approve-btn"
                        style={{
                          padding: "12px 18px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                        onClick={approveSelectedReturns}
                      >
                        ✓ Approve Selected
                      </button>

                      <button
                        className="rop-approve-btn"
                        style={{
                          background: "#ff4d6d15",
                          border: "1px solid #ff4d6d40",
                          color: "#ff4d6d",
                          padding: "12px 18px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                        onClick={() => setSelectedReturns([])}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
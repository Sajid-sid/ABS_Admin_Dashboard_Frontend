import { useState, useEffect, useCallback } from "react";
import "./OffersManager.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// ── API ENDPOINTS ─────────────────────────
const PUBLIC_API = `${BASE_URL}/api/offers/public`; // for GET only
const ADMIN_API = `${BASE_URL}/api/offers`;         // for admin CRUD

// ── API HELPER ─────────────────────────
const api = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...options,
    });

    const text = await res.text();
    if (!text) return { success: false, message: "Empty response" };

    return JSON.parse(text);
  } catch (err) {
    return { success: false, message: "Network error" };
  }
};

const iconBtn = {
  padding: "6px 10px",
  margin: "0 4px",
  cursor: "pointer",
  border: "none",
  background: "#eee",
  borderRadius: "6px",
};

// ── HELPERS ─────────────────────────
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const isExpired = (d) => d && new Date(d) < new Date();
const getId = (o) => o._id || o.id; // universal id fix

// ── EMPTY FORM ──────────────────────
const EMPTY_FORM = {
  coupon_code: "",
  buy_qty: "",
  get_qty: "",
  uses_per_user: "1",
  expiry_date: "",
  first_order_only: false,
};

// ── COMPONENT ──────────────────────
export default function OfferManager() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const notify = (msg, type = "success") => setToast({ msg, type });

  // ── LOAD OFFERS ─────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    const res = await api(PUBLIC_API); // Only public GET
    if (res.success) {
      const normalized = (res.offers || []).map((o) => ({ ...o, _id: getId(o) }));
      setOffers(normalized);
    } else {
      notify(res.message, "error");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── STATS ─────────────────────
  const stats = {
    total: offers.length,
    active: offers.filter((o) => o.is_active && !isExpired(o.expiry_date)).length,
    expired: offers.filter((o) => isExpired(o.expiry_date)).length,
    uses: offers.reduce((acc, o) => acc + (o.total_uses || 0), 0),
  };

  // ── CREATE ─────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  // ── EDIT ─────────────────────
  const openEdit = (o) => {
    const id = getId(o);
    if (!id) return notify("Invalid offer", "error");

    setForm({
      coupon_code: o.coupon_code,
      buy_qty: o.buy_qty,
      get_qty: o.get_qty,
      uses_per_user: o.uses_per_user || 1,
      expiry_date: o.expiry_date?.slice(0, 10) || "",
      first_order_only: !!o.first_order_only,
    });
    setEditingId(id);
    setShowModal(true);
  };

  // ── SAVE ─────────────────────
  const handleSave = async () => {
    if (!form.coupon_code.trim()) return notify("Coupon required", "error");

    const payload = {
      ...form,
      coupon_code: form.coupon_code.toUpperCase(),
      buy_qty: Number(form.buy_qty),
      get_qty: Number(form.get_qty),
      uses_per_user: Number(form.uses_per_user || 1),
      expiry_date: form.expiry_date || null,
    };

    const isEdit = !!editingId;

    const res = await api(
      isEdit ? `${ADMIN_API}/${editingId}` : ADMIN_API, // admin CRUD
      { method: isEdit ? "PUT" : "POST", body: JSON.stringify(payload) }
    );

    if (res.success) {
      notify(isEdit ? "Updated!" : "Created!");
      setShowModal(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      load();
    } else {
      notify(res.message, "error");
    }
  };

  // ── TOGGLE ─────────────────────
  const toggle = async (o) => {
    const id = getId(o);
    if (!id) return notify("Invalid ID", "error");

    const res = await api(`${ADMIN_API}/${id}/toggle`, { method: "PATCH" }); // admin toggle
    if (res.success) load();
    else notify(res.message, "error");
  };

  // ── DELETE ─────────────────────
  const remove = async (o) => {
    const id = getId(o);
    if (!id) return notify("Invalid ID", "error");
    if (!window.confirm("Delete this offer?")) return;

    const res = await api(`${ADMIN_API}/${id}`, { method: "DELETE" });
    if (res.success) {
      notify("Deleted");
      load();
    } else {
      notify(res.message, "error");
    }
  };

  const Badge = ({ children, type = "default" }) => {
    const colors = {
      default: "#e5e7eb",
      success: "#22c55e",
      danger: "#ef4444",
      warning: "#f59e0b",
    };
    return (
      <span
        style={{
          padding: "4px 10px",
          borderRadius: "999px",
          fontSize: 12,
          fontWeight: 600,
          background: colors[type],
          color: "#fff",
        }}
      >
        {children}
      </span>
    );
  };

  // ── FILTER ─────────────────────
  const filtered = offers.filter((o) => {
    const exp = isExpired(o.expiry_date);
    const matchSearch = (o.coupon_code || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? o.is_active && !exp
        : filter === "expired"
        ? exp
        : !o.is_active;
    return matchSearch && matchFilter;
  });

  // ── UI ─────────────────────
  return (
    <div className="offer-manager">
      <h2>🎁 Offer Manager</h2>

      <button
        onClick={openCreate}
        style={{
          padding: "10px 20px",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(99,102,241,.35)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginLeft: "900px",
          marginBottom: "40px",
        }}
      >
        + New Offer
      </button>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Offers", value: stats.total, color: "#6366f1", bg: "#eef2ff", icon: "🎟️" },
          { label: "Active", value: stats.active, color: "#10b981", bg: "#d1fae5", icon: "✅" },
          { label: "Expired", value: stats.expired, color: "#ef4444", bg: "#fef2f2", icon: "⏰" },
          { label: "Total Uses", value: stats.uses, color: "#f59e0b", bg: "#fef3c7", icon: "📊" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTER + TABLE */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Search by code…"
            style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, width: 220, transition: "all .2s" }}
          />
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "active", "inactive", "expired"].map((f) => (
              <button
                key={f}
                className="tab-btn"
                onClick={() => setFilter(f)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1.5px solid",
                  borderColor: filter === f ? "#6366f1" : "#e2e8f0",
                  background: filter === f ? "#eef2ff" : "#fff",
                  color: filter === f ? "#6366f1" : "#64748b",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: 13 }}>
            {filtered.length} coupon{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>Loading offers…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
            <p style={{ fontWeight: 600, color: "#475569" }}>No offers found</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your filters or create a new coupon</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>BOGO</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const exp = isExpired(o.expiry_date);
                return (
                  <tr key={getId(o) || o.coupon_code}>
                    <td>{o.coupon_code}</td>
                    <td>Buy {o.buy_qty} Get {o.get_qty}</td>
                    <td style={{ color: exp ? "red" : "black" }}>{formatDate(o.expiry_date)}</td>
                    <td>
                      <span className={o.is_active ? "active" : "inactive"}>
                        {exp ? "Expired" : o.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => openEdit(o)}>✏️Edit</button>
                      <button className="action-btn" onClick={() => toggle(o)} title={o.is_active ? "Deactivate" : "Activate"} style={{ ...iconBtn, fontSize: 15, transition: "opacity .15s" }}>
                        {o.is_active ? "⏸" : "▶️"}
                      </button>
                      <button onClick={() => remove(o)}>🗑Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: 520, boxShadow: "0 24px 80px rgba(0,0,0,.2)", animation: "slideUp .25s ease", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{editingId ? "Edit Offer" : "Create Offer"}</h2>
              <button onClick={() => setShowModal(false)} style={iconBtn}>×</button>
            </div>

            <div className="form-group">
              <label>Coupon Code</label>
              <input placeholder="Enter coupon code" value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Buy Quantity</label>
              <input type="number" placeholder="Enter buy quantity" value={form.buy_qty} onChange={(e) => setForm({ ...form, buy_qty: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Get Quantity</label>
              <input type="number" placeholder="Enter get quantity" value={form.get_qty} onChange={(e) => setForm({ ...form, get_qty: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={checkLabel}>
                <input type="checkbox" checked={form.first_order_only} onChange={(e) => setForm((f) => ({ ...f, first_order_only: e.target.checked }))} style={{ accentColor: "#6366f1", width: 16, height: 16 }} />
                <div>
                  <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14, marginTop: "20px" }}>First order only</span>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>Only valid for a customer's first purchase</p>
                </div>
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleSave}>Save</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}

const checkLabel = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  cursor: "pointer",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  transition: "border-color .2s",
  marginTop: "10px",
};
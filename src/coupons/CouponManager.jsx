import { useState, useEffect, useCallback } from "react";


const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API = `${BASE_URL}/api/coupons`;

// ── helpers ────────────────────────────────────────────────
const api = async (url, options = {}) => {
  const token = localStorage.getItem("token"); // ← matches your admin login key

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    ...options,
  });

  const text = await res.text();

  // Log every response so you can debug easily
  console.log(`[API ${options.method || "GET"} ${url}] Status: ${res.status}`, text.slice(0, 300));

  if (!text || text.trim() === "") {
    return { success: false, message: `Server returned empty response (${res.status})` };
  }

  try {
    return JSON.parse(text);
  } catch {
    // Server sent HTML — means 404 route not found or 500 crash
    return {
      success: false,
      message:
        res.status === 404
          ? "Route not found — make sure app.use('/api/coupons', couponRoutes) is in app.js"
          : res.status === 401
          ? "Unauthorized — check your token key in localStorage"
          : `Server error ${res.status} — check backend console`,
    };
  }
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
const isExpired = (d) => d && new Date(d) < new Date();

const TYPE_META = {
  percentage:    { label: "Percentage",    icon: "%",  color: "#6366f1", bg: "#eef2ff" },
  fixed:         { label: "Fixed Amount",  icon: "₹",  color: "#0ea5e9", bg: "#e0f2fe" },
  free_shipping: { label: "Free Shipping", icon: "🚚", color: "#10b981", bg: "#d1fae5" },
};

const EMPTY_FORM = {
  code: "", type: "percentage", value: "", min_order: "",
  per_user_limit: "1", first_order_only: false, expires_at: "",
};

// ── sub-components ─────────────────────────────────────────
function Badge({ type }) {
  const m = TYPE_META[type] || TYPE_META.fixed;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      color: m.color, background: m.bg, border: `1px solid ${m.color}22`,
    }}>
      {m.icon} {m.label}
    </span>
  );
}

function StatusPill({ active, expired }) {
  if (expired) return <span style={pill("#ef4444", "#fef2f2")}>Expired</span>;
  return active
    ? <span style={pill("#10b981", "#d1fae5")}>Active</span>
    : <span style={pill("#94a3b8", "#f1f5f9")}>Inactive</span>;
}
const pill = (c, bg) => ({
  padding: "3px 12px", borderRadius: 20, fontSize: 12,
  fontWeight: 600, color: c, background: bg,
});

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!msg) return null;
  const colors = { success: ["#10b981", "#d1fae5"], error: ["#ef4444", "#fef2f2"] };
  const [c, bg] = colors[type] || colors.success;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      padding: "14px 20px", borderRadius: 12, background: bg,
      border: `1.5px solid ${c}44`, color: c, fontWeight: 600,
      fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,.12)",
      display: "flex", alignItems: "center", gap: 10, maxWidth: 360,
      animation: "slideUp .25s ease",
    }}>
      {type === "success" ? "✓" : "✕"} {msg}
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: c, fontSize: 16 }}>×</button>
    </div>
  );
}

function UsageDrawer({ coupon, onClose }) {
  const [usage, setUsage]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`${API}/${coupon.id}/usage`).then((d) => {
      setUsage(d.usage || []);
      setLoading(false);
    });
  }, [coupon.id]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
      zIndex: 1000, display: "flex", justifyContent: "flex-end",
    }} onClick={onClose}>
      <div style={{
        width: 480, height: "100vh", background: "#fff",
        overflow: "auto", padding: 32, boxShadow: "-8px 0 32px rgba(0,0,0,.15)",
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Usage History</h3>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Coupon: <b>{coupon.code}</b></p>
          </div>
          <button onClick={onClose} style={iconBtn}>×</button>
        </div>
        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center", marginTop: 48 }}>Loading…</p>
        ) : usage.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 64, color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>No usage recorded yet</p>
          </div>
        ) : (
          usage.map((u, i) => (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: 10, background: "#f8fafc",
              border: "1px solid #e2e8f0", marginBottom: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>{u.fullName}</span>
                <span style={{ color: "#10b981", fontWeight: 700, fontSize: 14 }}>₹{u.totalAmount}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Order #{u.order_id} · {formatDate(u.used_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const iconBtn = {
  width: 36, height: 36, borderRadius: 8, border: "1px solid #e2e8f0",
  background: "#fff", cursor: "pointer", fontSize: 18, color: "#64748b",
  display: "flex", alignItems: "center", justifyContent: "center",
};

// ── main component ─────────────────────────────────────────
export default function CouponManager() {
  const [coupons, setCoupons]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editCoupon, setEditCoupon]       = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState(null);
  const [search, setSearch]               = useState("");
  const [filter, setFilter]               = useState("all");
  const [usageDrawer, setUsageDrawer]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const notify = (msg, type = "success") => setToast({ msg, type });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api(API);
    if (!data.success) {
      notify(data.message, "error");
      setCoupons([]);
    } else {
      setCoupons(data.coupons || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setEditCoupon(null); setShowModal(true); };
  const openEdit = (c) => {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value?.toString() || "",
      min_order: c.min_order?.toString() || "",
      per_user_limit: c.per_user_limit?.toString() || "1",
      first_order_only: !!c.first_order_only,
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
      is_active: c.is_active,
    });
    setEditCoupon(c);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return notify("Coupon code is required", "error");
    if (form.type !== "free_shipping" && (!form.value || isNaN(form.value)))
      return notify("Enter a valid discount value", "error");

    setSaving(true);
    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      value: form.type === "free_shipping" ? 0 : parseFloat(form.value),
      min_order: parseFloat(form.min_order) || 0,
      per_user_limit: parseInt(form.per_user_limit) || 1,
      expires_at: form.expires_at || null,
    };

    const res = editCoupon
      ? await api(`${API}/${editCoupon.id}`, { method: "PUT", body: JSON.stringify(payload) })
      : await api(API, { method: "POST", body: JSON.stringify(payload) });

    setSaving(false);
    if (res.success) {
      notify(editCoupon ? "Coupon updated!" : "Coupon created!");
      setShowModal(false);
      load();
    } else {
      notify(res.message || "Something went wrong", "error");
    }
  };

  const handleToggle = async (c) => {
    const res = await api(`${API}/${c.id}/toggle`, { method: "PATCH" });
    if (res.success) {
      notify(`Coupon ${c.is_active ? "deactivated" : "activated"}`);
      load();
    } else {
      notify(res.message, "error");
    }
  };

  const handleDelete = async () => {
    const res = await api(`${API}/${deleteConfirm.id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    if (res.success) { notify("Coupon deleted"); load(); }
    else notify(res.message, "error");
  };

  // ── filtering ──────────────────────────────────────────
  const filtered = coupons.filter((c) => {
    const exp = isExpired(c.expires_at);
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"      ? true :
      filter === "active"   ? (c.is_active && !exp) :
      filter === "inactive" ? !c.is_active :
      filter === "expired"  ? exp : true;
    return matchSearch && matchFilter;
  });

  // ── stats ──────────────────────────────────────────────
  const stats = {
    total:   coupons.length,
    active:  coupons.filter((c) => c.is_active && !isExpired(c.expires_at)).length,
    expired: coupons.filter((c) => isExpired(c.expires_at)).length,
    uses:    coupons.reduce((s, c) => s + (c.actual_used || 0), 0),
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#f8fafc", padding: "32px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap');
        * { box-sizing: border-box; }
        input, select { outline: none; }
        input:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px #6366f122 !important; }
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
        .row-hover:hover { background: #f1f5f9 !important; }
        .action-btn:hover { opacity: .75 !important; }
        .tab-btn { transition: all .15s; }
        .tab-btn:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0f172a", letterSpacing: -0.5 }}>🎟️ Coupon Manager</h1>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>Create and manage discount coupons for your store</p>
        </div>
        <button onClick={openCreate} style={{
          padding: "10px 20px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
          fontWeight: 700, fontSize: 14, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(99,102,241,.35)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          + New Coupon
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Coupons", value: stats.total,   color: "#6366f1", bg: "#eef2ff", icon: "🎟️" },
          { label: "Active",        value: stats.active,  color: "#10b981", bg: "#d1fae5", icon: "✅" },
          { label: "Expired",       value: stats.expired, color: "#ef4444", bg: "#fef2f2", icon: "⏰" },
          { label: "Total Uses",    value: stats.uses,    color: "#f59e0b", bg: "#fef3c7", icon: "📊" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 14, padding: "20px 22px",
            border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search + Table */}
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
              <button key={f} className="tab-btn" onClick={() => setFilter(f)} style={{
                padding: "8px 16px", borderRadius: 8, border: "1.5px solid",
                borderColor: filter === f ? "#6366f1" : "#e2e8f0",
                background: filter === f ? "#eef2ff" : "#fff",
                color: filter === f ? "#6366f1" : "#64748b",
                fontWeight: 600, fontSize: 13, cursor: "pointer", textTransform: "capitalize",
              }}>{f}</button>
            ))}
          </div>
          <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: 13 }}>
            {filtered.length} coupon{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>Loading coupons…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
            <p style={{ fontWeight: 600, color: "#475569" }}>No coupons found</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your filters or create a new coupon</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                {["Code", "Type", "Discount", "Min Order", "Limits", "Expiry", "Status", "Uses", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const exp = isExpired(c.expires_at);
                return (
                  <tr key={c.id} className="row-hover" style={{ borderBottom: "1px solid #f8fafc", transition: "background .15s" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 14, color: "#1e293b", background: "#f8fafc", padding: "4px 10px", borderRadius: 6, border: "1px solid #e2e8f0", letterSpacing: 1 }}>{c.code}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}><Badge type={c.type} /></td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#1e293b", fontSize: 15 }}>
                      {c.type === "percentage" ? `${c.value}%` : c.type === "fixed" ? `₹${c.value}` : "Free"}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#475569", fontSize: 14 }}>
                      {c.min_order > 0 ? `₹${c.min_order}` : <span style={{ color: "#cbd5e1" }}>None</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.7 }}>
                        <div>👤 {c.per_user_limit}×/user</div>
                        {c.first_order_only ? <div style={{ color: "#f59e0b", fontWeight: 600 }}>⭐ First order</div> : null}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: exp ? "#ef4444" : "#475569" }}>
                      {c.expires_at ? formatDate(c.expires_at) : <span style={{ color: "#cbd5e1" }}>Never</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusPill active={c.is_active} expired={exp} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => setUsageDrawer(c)} style={{ fontWeight: 700, color: "#6366f1", background: "#eef2ff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>
                        {c.actual_used || 0}
                      </button>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="action-btn" onClick={() => openEdit(c)} title="Edit" style={{ ...iconBtn, fontSize: 15, transition: "opacity .15s" }}>✏️</button>
                        <button className="action-btn" onClick={() => handleToggle(c)} title={c.is_active ? "Deactivate" : "Activate"} style={{ ...iconBtn, fontSize: 15, transition: "opacity .15s" }}>
                          {c.is_active ? "⏸" : "▶️"}
                        </button>
                        <button className="action-btn" onClick={() => setDeleteConfirm(c)} title="Delete" style={{ ...iconBtn, fontSize: 15, transition: "opacity .15s", borderColor: "#fecaca", color: "#ef4444" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: 520, boxShadow: "0 24px 80px rgba(0,0,0,.2)", animation: "slideUp .25s ease", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{editCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
              <button onClick={() => setShowModal(false)} style={iconBtn}>×</button>
            </div>
            <div style={{ display: "grid", gap: 18 }}>
              <Field label="Coupon Code *">
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20"
                  style={{ ...input, fontFamily: "'DM Mono', monospace", letterSpacing: 1, fontWeight: 600 }} />
              </Field>
              <Field label="Discount Type *">
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={input}>
                  <option value="percentage">Percentage (e.g. 20% off)</option>
                  <option value="fixed">Fixed Amount (e.g. ₹100 off)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </Field>
              {form.type !== "free_shipping" && (
                <Field label={form.type === "percentage" ? "Discount % *" : "Discount Amount (₹) *"}>
                  <input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 100"} min={1} max={form.type === "percentage" ? 100 : undefined} style={input} />
                </Field>
              )}
              <Field label="Minimum Order Value (₹)" hint="Leave 0 for no minimum">
                <input type="number" value={form.min_order} onChange={(e) => setForm((f) => ({ ...f, min_order: e.target.value }))} placeholder="e.g. 500" min={0} style={input} />
              </Field>
              <Field label="Uses Per User" hint="How many times a single user can use this">
                <input type="number" value={form.per_user_limit} onChange={(e) => setForm((f) => ({ ...f, per_user_limit: e.target.value }))} min={1} style={input} />
              </Field>
              <Field label="Expiry Date" hint="Leave empty for no expiry">
                <input type="date" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))} style={input} />
              </Field>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={checkLabel}>
                  <input type="checkbox" checked={form.first_order_only} onChange={(e) => setForm((f) => ({ ...f, first_order_only: e.target.checked }))}
                    style={{ accentColor: "#6366f1", width: 16, height: 16 }} />
                  <div>
                    <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 14 }}>First order only</span>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>Only valid for a customer's first purchase</p>
                  </div>
                </label>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px 0", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "12px 0", borderRadius: 10, border: "none", background: saving ? "#c7d2fe" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, boxShadow: saving ? "none" : "0 4px 14px rgba(99,102,241,.35)" }}>
                  {saving ? "Saving…" : editCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 380, boxShadow: "0 24px 80px rgba(0,0,0,.2)", animation: "slideUp .2s ease" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: "center" }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", textAlign: "center", color: "#0f172a", fontWeight: 800 }}>Delete Coupon?</h3>
            <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>
              <b>{deleteConfirm.code}</b> will be permanently removed along with its usage history.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", color: "#64748b" }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {usageDrawer && <UsageDrawer coupon={usageDrawer} onClose={() => setUsageDrawer(null)} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── tiny helper components ─────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const input = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1.5px solid #e2e8f0", fontSize: 14,
  color: "#1e293b", background: "#fff", transition: "all .2s",
};

const checkLabel = {
  display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
  padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0",
  transition: "border-color .2s",
};
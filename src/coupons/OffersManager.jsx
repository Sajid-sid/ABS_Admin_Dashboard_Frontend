import { useState, useEffect, useCallback, useRef } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;

// ── API ENDPOINTS ─────────────────────────
const PUBLIC_API = `${BASE_URL}/api/offers/public`;
const ADMIN_API = `${BASE_URL}/api/offers`;

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
    console.error("API Error:", err);
    return { success: false, message: "Network error" };
  }
};

// ── HELPERS ─────────────────────────
const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const isExpired = (d) => d && new Date(d) < new Date();

// ── EMPTY FORM ──────────────────────
const EMPTY_FORM = {
  coupon_code: "",
  title: "",
  buy_qty: "",
  get_qty: "",
  uses_per_user: "1",
  expiry_date: "",
  first_order_only: false,
  category: [],
  is_active: true,
};

const normalize = (val = "") =>
  String(val)
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
    
export default function OfferManager() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const CATEGORY_OPTIONS = ["Necklaces", "Rings", "Earrings","Braceletes","B1G1"];
  const [catOpen, setCatOpen] = useState(false);
  const dropdownRef = useRef(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
  const getOfferId = (offer) => {
  return Number(offer?.id ?? offer?._id ?? null);
};

useEffect(() => {
  const handleClickOutside = (e) => {
    if (!dropdownRef.current) return;

    if (!dropdownRef.current.contains(e.target)) {
      setCatOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // ── LOAD OFFERS ─────────────────────
const loadOffers = useCallback(async () => {
  setLoading(true);

  try {
    const res = await api(PUBLIC_API);

    if (!res.success) {
      notify(res.message || "Failed to load offers", "error");
      return;
    }

    const cleaned = (res.offers || []).map((o) => {
      let parsed = [];

      try {
        parsed = Array.isArray(o.category)
          ? o.category
          : JSON.parse(o.category || "[]");
      } catch {
        parsed = [];
      }

      return {
        ...o,

        // 🔥 FINAL NORMALIZED CATEGORY
        category: parsed
          .filter(Boolean)
          .map(normalize),
      };
    });

    setOffers(cleaned);
  } catch (err) {
    console.error("loadOffers error:", err);
    notify("Something went wrong while loading offers", "error");
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  // ── STATS ─────────────────────
  const stats = {
    total: offers.length,
    active: offers.filter((o) => o.is_active && !isExpired(o.expiry_date)).length,
    inactive: offers.filter((o) => !o.is_active && !isExpired(o.expiry_date)).length,
    expired: offers.filter((o) => isExpired(o.expiry_date)).length,
    uses: offers.reduce((acc, o) => acc + (o.total_uses || 0), 0),
  };

  // ── CREATE ─────────────────────
  const openCreate = () => {
    setForm({ ...EMPTY_FORM, category: [] });
    setEditingId(null);
    setShowModal(true);
    setCatOpen(false);
  };

  // ── EDIT ─────────────────────
const openEdit = (o) => {
  const id = getOfferId(o);

  if (!id) {
    notify("Invalid offer ID", "error");
    return;
  }

  setEditingId(id);

  let parsedCategory = [];

  try {
    parsedCategory = Array.isArray(o.category)
      ? o.category
      : JSON.parse(o.category || "[]");
  } catch {
    parsedCategory = [];
  }

  // 🔥 UI OPTIONS (single source of truth)
  const CATEGORY_OPTIONS = [
    "Necklaces",
    "Rings",
    "Earrings",
    "Braceletes",
    "B1G1"
  ];

  // 🔥 NORMALIZED MATCHING (SAFE + CLEAN)
  const normalizedCategory = parsedCategory
    .map(normalize)
    .map((cat) =>
      CATEGORY_OPTIONS.find(
        (opt) => normalize(opt) === cat
      )
    )
    .filter(Boolean);

  setForm({
    coupon_code: o.coupon_code || "",
    title: o.title || "",
    buy_qty: o.buy_qty || "",
    get_qty: o.get_qty || "",
    uses_per_user: o.uses_per_user || "1",
    expiry_date: o.expiry_date?.slice(0, 10) || "",
    first_order_only: !!o.first_order_only,
    is_active: !!o.is_active,

    // ✅ clean mapped categories
    category: normalizedCategory,
  });

  setShowModal(true);
};

  // ── SAVE ─────────────────────
const handleSave = async () => {
  console.log("🟡 editingId RAW:", editingId);

  const id = Number(editingId);
  const isEdit = editingId !== null && editingId !== undefined;

  console.log("🟢 FINAL EDIT ID:", id, "isEdit:", isEdit);

  if (!form.coupon_code.trim()) {
    return notify("Coupon code required", "error");
  }

  if (isEdit && (!id || id <= 0)) {
    return notify("Invalid offer ID", "error");
  }

  const payload = {
    coupon_code: form.coupon_code.toUpperCase(),
    title: form.title,
    buy_qty: Number(form.buy_qty),
    get_qty: Number(form.get_qty),
    uses_per_user: Number(form.uses_per_user) || 1,
    expiry_date: form.expiry_date || null,
    first_order_only: form.first_order_only,
    is_active: form.is_active,
    category: form.category || [],
  };

  const url = isEdit ? `${ADMIN_API}/${id}` : ADMIN_API;

  console.log("📦 REQUEST:", {
    url,
    method: isEdit ? "PUT" : "POST",
    payload,
  });

  const res = await api(url, {
    method: isEdit ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });

  console.log("🟡 RESPONSE:", res);

  if (res.success) {
    notify(isEdit ? "Updated!" : "Created!");
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    loadOffers();
  } else {
    notify(res.message || "Update failed", "error");
  }
};

  // ── TOGGLE STATUS ─────────────────────
  const toggleStatus = async (o) => {
    const id = o.id || o._id;
    if (!id) return notify("Invalid ID", "error");
    const res = await api(`${ADMIN_API}/${id}/toggle`, { method: "PATCH" });
    if (res.success) loadOffers();
    else notify(res.message, );
  };

  // ── DELETE ─────────────────────
  const deleteOffer = async (o) => {
    const id = o.id || o._id;
    if (!id) return notify("Invalid ID", "error");
    if (!window.confirm("Delete this offer?")) return;
    const res = await api(`${ADMIN_API}/${id}`, { method: "DELETE" });
    if (res.success) {
      notify("Deleted");
      loadOffers();
    } else {
      notify(res.message, );
    }
  };

  // ── HANDLE CATEGORY CHANGE ─────────────────────
const handleCategoryChange = (category) => {
  setForm((prev) => {
    const norm = normalize(category);

    const exists = prev.category
      .map(normalize)
      .includes(norm);

    const updated = exists
      ? prev.category.filter((c) => normalize(c) !== norm)
      : [...prev.category, category];

    return {
      ...prev,
      category: updated,
    };
  });
};

  // ── FILTER OFFERS ─────────────────────
  const filteredOffers = offers.filter((o) => {
    const expired = isExpired(o.expiry_date);
    const matchesSearch = o.coupon_code?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" ? true
      : filter === "active" ? o.is_active && !expired
      : filter === "inactive" ? !o.is_active && !expired
      : filter === "expired" ? expired : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "28px" }}>🎁 Offer Manager</h2>
        <button
          onClick={openCreate}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + New Offer
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Offers", value: stats.total, color: "#6366f1", bg: "#eef2ff", icon: "🎟️" },
          { label: "Active", value: stats.active, color: "#10b981", bg: "#d1fae5", icon: "✅" },
          { label: "Inactive", value: stats.inactive, color: "#f59e0b", bg: "#fef3c7", icon: "⏸️" },
          { label: "Expired", value: stats.expired, color: "#ef4444", bg: "#fef2f2", icon: "⏰" },
          { label: "Total Uses", value: stats.uses, color: "#f59e0b", bg: "#fef3c7", icon: "📊" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search by code..."
            style={{ padding: "9px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, width: 220 }}
          />
          <div style={{ display: "flex", gap: 4 }}>
            {["all", "active", "inactive", "expired"].map((f) => (
              <button
                key={f}
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
            {filteredOffers.length} coupon{filteredOffers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center" }}>Loading offers...</div>
        ) : filteredOffers.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎟️</div>
            <p>No offers found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "16px", textAlign: "left" }}>Code</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Title</th>
                 <th style={{ padding: "16px", textAlign: "left" }}>BOGO</th>
<th style={{ padding: "16px", textAlign: "left" }}>Uses/User</th>
<th style={{ padding: "16px", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Expiry</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "16px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map((offer) => (
                  <tr key={offer.id || offer._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px", fontWeight: 500 }}>{offer.coupon_code}</td>
                    <td style={{ padding: "16px" }}>{offer.title}</td>
                    <td style={{ padding: "16px" }}>
  Buy {offer.buy_qty} Get {offer.get_qty}
</td>

<td style={{ padding: "16px", fontWeight: 600 }}>
  {offer.uses_per_user ?? 1}
</td>
                    <td style={{ padding: "16px" }}>
                      {Array.isArray(offer.category) && offer.category.length > 0 ? (
                        offer.category.map((cat, i) => (
                          <span
                            key={i}
                            style={{
                              background: "#eef2ff",
                              color: "#6366f1",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              marginRight: "5px",
                              fontSize: "12px",
                              fontWeight: "600",
                              display: "inline-block",
                              marginBottom: "4px",
                            }}
                          >
                            {cat}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "16px", color: isExpired(offer.expiry_date) ? "#ef4444" : "#475569" }}>
                      {formatDate(offer.expiry_date)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: 12,
                        fontWeight: 600,
                        background: isExpired(offer.expiry_date) ? "#fef2f2" : (offer.is_active ? "#d1fae5" : "#fef3c7"),
                        color: isExpired(offer.expiry_date) ? "#ef4444" : (offer.is_active ? "#10b981" : "#f59e0b"),
                      }}>
                        {isExpired(offer.expiry_date) ? "Expired" : (offer.is_active ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button onClick={() => openEdit(offer)} style={{ marginRight: "8px", padding: "6px 10px", cursor: "pointer" }}>✏️ </button>
                      <button onClick={() => toggleStatus(offer)} style={{ marginRight: "8px", padding: "6px 10px", cursor: "pointer" }}>
                        {offer.is_active ? "⏸" : "▶️"}
                      </button>
                      <button onClick={() => deleteOffer(offer)} style={{ padding: "6px 10px", cursor: "pointer" }}>🗑 </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? "Edit Offer" : "Create Offer"}</h2>
            
            <div style={{ marginBottom: 15 }}>
              <label>Coupon Code *</label>
              <input value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} style={{ width: "100%", padding: 8 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ width: "100%", padding: 8 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>Buy Quantity *</label>
              <input type="number" value={form.buy_qty} onChange={(e) => setForm({ ...form, buy_qty: e.target.value })} style={{ width: "100%", padding: 8 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>Get Quantity *</label>
              <input type="number" value={form.get_qty} onChange={(e) => setForm({ ...form, get_qty: e.target.value })} style={{ width: "100%", padding: 8 }} />
            </div>
            <div style={{ marginBottom: 15 }}>
  <label>Uses Per User</label>
  <input
    type="number"
    min="1"
    value={form.uses_per_user}
    onChange={(e) =>
      setForm({ ...form, uses_per_user: e.target.value })
    }
    style={{ width: "100%", padding: 8 }}
  />
</div>

            <div style={{ marginBottom: 15 }} ref={dropdownRef}>
              <label>Category</label>
              <div onClick={() => setCatOpen(!catOpen)} style={{ border: "1px solid #ccc", padding: 8, borderRadius: 4, cursor: "pointer" }}>
                {form.category.length > 0 ? form.category.join(", ") : "Select categories"}
              </div>
              {catOpen && (
                <div style={{ border: "1px solid #ccc", marginTop: 5, padding: 10, borderRadius: 4, background: "#fff" }}>
                  {CATEGORY_OPTIONS.map(cat => (
                    <label key={cat} style={{ display: "block", marginBottom: 5 }}>
                      <input type="checkbox"checked={form.category.map(c => c.toLowerCase()).includes(cat.toLowerCase())} onChange={() => handleCategoryChange(cat)} />
                      <span style={{ marginLeft: 8 }}>{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>Expiry Date</label>
              <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} style={{ width: "100%", padding: 8 }} />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label>
                <input type="checkbox" checked={form.first_order_only} onChange={(e) => setForm({ ...form, first_order_only: e.target.checked })} />
                <span style={{ marginLeft: 8 }}>First order only</span>
              </label>
            </div>

           

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave} style={{ padding: "10px 20px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" }}>Save</button>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", background: "#ccc", border: "none", borderRadius: 5, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, right: 20, padding: "12px 20px", background: toast.type === "error" ? "#ef4444" : "#10b981", color: "#fff", borderRadius: 8 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
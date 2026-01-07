import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StockInformation.css";

//  Load from .env
const BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${BASE_URL}/api`;

export default function StockInformation() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockValue, setStockValue] = useState("");

  // NEW — Fetch Confirmed + Pending counts
  const fetchBookingCounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      const orders = res.data.orders || [];

      const countMap = {}; // productId → { confirmed, pending }

      orders.forEach((order) => {
        if (!Array.isArray(order.items)) return;

        order.items.forEach((item) => {
          const pid = item.productId;
          const status = item.itemStatus;

          if (!pid) return;

          if (!countMap[pid]) {
            countMap[pid] = { confirmed: 0, pending: 0 };
          }

          if (status === "Confirmed") {
            countMap[pid].confirmed += item.quantity;
          } else if (status === "Pending") {
            countMap[pid].pending += item.quantity;
          }
        });
      });

      return countMap;
    } catch (err) {
      console.error("Error fetching booking counts:", err);
      return {};
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const catRes = await axios.get(`${API_URL}/productCategories`);
      const subRes = await axios.get(`${API_URL}/subcategories`);

      //  NEW — Fetch Confirmed + Pending counts
      const bookingCounts = await fetchBookingCounts();

      const subList = subRes.data;

      const subListWithStock = await Promise.all(
        subList.map(async (item) => {
          const totalStock = await fetchStockById(item.id);

          const counts = bookingCounts[item.id] || {
            confirmed: 0,
            pending: 0,
          };


          const productLeft =
            totalStock - (counts.confirmed + counts.pending);

          return {
            ...item,
            totalStock,
            confirmed: counts.confirmed,
            pending: counts.pending,
            productLeft: productLeft < 0 ? 0 : productLeft,
          };
        })
      );

      setCategories(catRes.data);
      setSubcategories(subListWithStock);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching:", err);
      setLoading(false);
    }
  };

  const categoryList = [...new Set(categories.map((c) => c.productCategory))];

  const filteredSubcategories = subcategories.filter((item) => {
    const matchesSearch =
      item.subCategaryname.toLowerCase().includes(search.toLowerCase()) ||
      item.productCategory.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || item.productCategory === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockValue("");
    setShowModal(true);
  };

  const updateStock = async () => {
    if (!stockValue || isNaN(stockValue)) {
      alert("Enter valid stock quantity");
      return;
    }

    try {
      await axios.post(`${API_URL}/stock/updateStock`, {
        subcategoryId: selectedProduct.id,
        stock: Number(stockValue),
      });

      alert("Stock Updated Successfully!");
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error("Stock update error:", err);
      alert("Failed to update stock");
    }
  };

  const fetchStockById = async (subcategoryId) => {
    try {
      const res = await axios.get(
        `${API_URL}/stock/getStockById?subcategoryId=${subcategoryId}`
      );
      return res.data.totalStock ?? 0;
    } catch (err) {
      console.error("Error fetching stock:", err);
      return 0;
    }
  };

  return (
    <div className="stock-container">
      <h1> Product Categories & Stock</h1>

      <input
        type="text"
        placeholder="Search sub-category..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="category-dropdown"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="">All Categories</option>
        {categoryList.map((cat, i) => (
          <option key={i} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table className="stock-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Price</th>
              <th>Image</th>
              <th>Total Stock</th>
              <th>Confirmed</th>
              <th>Pending</th>
              <th>Left</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>
            {filteredSubcategories.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">No records found</td>
              </tr>
            ) : (
              filteredSubcategories.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.productCategory}</td>
                  <td>{item.subCategaryname}</td>
                  <td>₹{item.price}</td>

                  <td>
                    <img src={item.image_1} alt="img" className="sub-img" />
                  </td>

                  <td>{item.totalStock}</td>
                  <td>{item.confirmed}</td>
                  <td>{item.pending}</td>
                  <td>{item.productLeft}</td>

                  <td>
                    <button
                      className="add-stock-btn"
                      onClick={() => openStockModal(item)}
                    >
                      Add Stock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Add Stock</h2>
            <p><b>Product:</b> {selectedProduct?.subCategaryname}</p>

            <input
              type="number"
              placeholder="Enter stock quantity"
              className="stock-input"
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
            />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={updateStock}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

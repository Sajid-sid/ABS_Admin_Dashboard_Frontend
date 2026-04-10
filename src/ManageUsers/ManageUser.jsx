import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageUser.css";
import { useSelector } from "react-redux";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ManageUser() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // ================= AUTH CHECK =================
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchUsers(); // ✅ everyone can access
    }
  }, [token]);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Failed to fetch users ❌");
    } finally {
      setLoading(false);
    }
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // UPDATE USER
        await axios.put(
          `${BASE_URL}/api/auth/${editId}`,
          { name, email, role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("User updated ✅");
      } else {
        // ADD USER
        await axios.post(
          `${BASE_URL}/api/auth/add`,
          { name, email, password, role },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        alert("User added ✅");
      }

      // RESET FORM
      setName("");
      setEmail("");
      setPassword("");
      setRole("");
      setEditId(null);

      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong ❌");
    }
  };

  // ================= EDIT =================
  const handleEdit = (u) => {
    setName(u.name);
    setEmail(u.email);
    setRole(u.role?.toLowerCase());
    setEditId(u.id);
  };

  // ================= DELETE =================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/auth/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Deleted ✅");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  // ================= UPDATE PASSWORD =================
  const updatePasswordUser = (u) => {
    navigate(`/update-password/${u.id}`);
  };

  return (
    <div className="user-manager">
      <h2>{editId ? "Edit User" : "Add User"}</h2>

      <form className="user-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {!editId && (
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="" disabled>Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">
          {editId ? "Update User" : "Add User"}
        </button>
      </form>

      <h2>All Users</h2>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found ❌</p>
      ) : (
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>

                  <td>
                    <span className="role-badge">
                      {u.role || "user"}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button onClick={() => handleEdit(u)}>Edit</button>
                      <button onClick={() => deleteUser(u.id)}>Delete</button>
                      <button onClick={() => updatePasswordUser(u)}>
                        Update Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
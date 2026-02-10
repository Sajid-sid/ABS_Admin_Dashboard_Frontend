import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import AddProduct from "./Products/AddProduct";
import AddProductCategory from "./Products/AddProductCategory";
import AddSubCategory from "./Products/AddSubCategory";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminOrders from "./orders/OrdersPage";
import Banner  from './Banner/BannerManager';
import AddAdVideos from "./adVideo/AddAdVideos";
import StockInformation from "./StockInformation/StockInformation";

// Protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Routes>
      {/* ---- Public Route ---- */}
      <Route path="/" element={<Login />} />

      {/* ---- Dashboard ---- */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* ---- Add Product ---- */}
      <Route
        path="/add-product"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AddProduct />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* ---- Product Category ---- */}
      <Route
        path="/category"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AddProductCategory />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* ---- Sub Category ---- */}
      <Route
        path="/sub-category"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AddSubCategory />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* ---- Orders ---- */}
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AdminOrders />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* ---- Dynamic Order Status ---- */}
      <Route
        path="/orders/:status"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AdminOrders />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* ⭐ ---- Stock Information ---- */}
      <Route
        path="/stock-information"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <StockInformation />
            </DashboardLayout>
          </PrivateRoute>
        }
      />


      {/* ---- Orders ---- */}
      <Route
        path="/banner"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Banner />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      
      <Route
        path="/ad-videos"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <AddAdVideos />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

     

      {/* ---- Default Fallback ---- */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;

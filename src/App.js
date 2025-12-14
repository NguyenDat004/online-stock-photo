import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Upload from "./pages/Upload";
import Checkout from "./pages/Checkout";
import PhotoDetail from "./pages/PhotoDetail";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
// import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import Wallet from "./pages/Wallet";
import WithdrawRequest from "./pages/WithdrawRequest";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import Photos from "./components/admin/AdminPhotos";
import Categories from "./components/admin/AdminCategories";
import Users from "./components/admin/AdminUsers";
import AdminRoute from "./components/admin/AdminRoute";
import Transaction from "./components/admin/AdminTransactions";
import AdminWithdrawRequests from "./components/admin/WithdrawRequests";

import Download from "./pages/Download";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserProfile from "./pages/UserProfile";

function App() {
  useEffect(() => {
    const preventContextMenu = (e) => e.preventDefault();
    const preventDragStart = (e) => e.preventDefault();

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("dragstart", preventDragStart);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("dragstart", preventDragStart);
    };
  }, []);
  return (
    <Router>
      <ToastContainer />

      <div
        className="app-wrapper"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />

        <div className="main-content" style={{ flex: 1 }}>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/photo/:id" element={<PhotoDetail />} />
            <Route path="/download" element={<Download />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/orders" element={<Orders />} />
            <Route
              path="/order-detail/:transactionId"
              element={<OrderDetail />}
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/withdraw-request" element={<WithdrawRequest />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="photos" element={<Photos />} />
              <Route path="withdraw-requests" element={<AdminWithdrawRequests />} />
              <Route path="categories" element={<Categories />} />
              <Route path="users" element={<Users />} />
              <Route path="transactions" element={<Transaction />} />
            </Route>
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;

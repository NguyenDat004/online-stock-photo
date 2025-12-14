import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import axios from "axios";
import "./Sidebar.css";
import "./Topbar.css";

const AdminLayout = () => {
  const [pendingCount, setPendingCount] = useState(0);

  // 🔥 Load số yêu cầu rút tiền "pending"
  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/withdraw/admin/list");
        const count = res.data.filter((x) => x.status === "pending").length;
        setPendingCount(count);
      } catch (err) {
        console.error("Load pending withdraw error:", err);
      }
    };

    loadPending();
  }, []);

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">

          <NavLink to="/admin" end className="sidebar-link">
            Dashboard
          </NavLink>

          <NavLink to="/admin/photos" className="sidebar-link">
            Quản lý ảnh
          </NavLink>

          <NavLink to="/admin/withdraw-requests" className="sidebar-link">
            Yêu cầu rút tiền
            {pendingCount > 0 && (
              <span className="badge bg-danger ms-2">{pendingCount}</span>
            )}
          </NavLink>

          <NavLink to="/admin/categories" className="sidebar-link">
            Danh mục
          </NavLink>

          <NavLink to="/admin/users" className="sidebar-link">
            Người dùng
          </NavLink>

          <NavLink to="/admin/transactions" className="sidebar-link">
            Giao dịch
          </NavLink>

        </nav>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <h3>Bảng điều khiển</h3>

          <div className="topbar-right">
            <Link to="/" className="btn btn-sm btn-primary">
              Về trang chính
            </Link>
          </div>
        </header>

        {/* Outlet render trang con */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

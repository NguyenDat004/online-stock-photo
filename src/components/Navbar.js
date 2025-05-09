import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS toast

function Navbar() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Thông tin từ CSDL
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/users/${currentUser.email}`
          );
          setUserData(res.data); // res.data.role, res.data.full_name, ...
        } catch (err) {
          console.error("Không lấy được thông tin người dùng từ server:", err);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      toast.success("Bạn đã đăng xuất thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/login"), 2000); // Chờ toast hiện xong rồi mới chuyển trang
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Không thể đăng xuất. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">
        📷 Stock Photo
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Trang chủ
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <Link className="nav-link" to="/upload">
                Tải ảnh lên
              </Link>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                Giỏ hàng
              </Link>
            </li>
          )}
          {user && (
            <li className="nav-item">
              <Link className="nav-link" to="/download">
                Kho Ảnh
              </Link>
            </li>
          )}
          {userData?.role === "admin" && (
            <li className="nav-item">
              <Link className="nav-link text-warning" to="/admin">
                Trang quản trị
              </Link>
            </li>
          )}
        </ul>

        <ul className="navbar-nav ms-auto">
          {user ? (
            <>
              <li className="nav-item d-flex align-items-center text-warning me-3">
                👤 {user.displayName || user.email}
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-light"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Đăng nhập
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  Đăng ký
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <ToastContainer /> {/* Thêm ToastContainer để hiển thị thông báo */}
    </nav>
  );
}

export default Navbar;

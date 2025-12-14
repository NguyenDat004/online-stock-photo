// Navbar.js
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Navbar.module.css"; // 🔹 Import CSS module

function Navbar() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
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
          setUserData(res.data);
        } catch (err) {
          console.error("Không lấy được thông tin người dùng:", err);
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
      toast.success("Bạn đã đăng xuất thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (error) {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg navbar-dark px-3 ${styles.navbarCustom}`}
      >
        <Link className={`navbar-brand ${styles.brand}`} to="/">
          📷 Stock Photo
        </Link>
        <button
          className="navbar-toggler ms-auto"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${styles.navLink}`} to="/">
                Trang chủ
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${styles.navLink}`} to="/upload">
                    Tải ảnh lên
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${styles.navLink}`} to="/cart">
                    Giỏ hàng
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${styles.navLink}`} to="/download">
                    Kho Ảnh
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${styles.navLink}`} to="/orders">
                    Đơn hàng
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${styles.navLink}`} to="/wallet">
                    Ví tiền
                  </Link>
                </li>
              </>
            )}
            {userData?.role === "admin" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${styles.navLink} text-warning`}
                  to="/admin"
                >
                  Trang quản trị
                </Link>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item d-flex align-items-center me-3">
                  <Link
                    to="/profile"
                    className="nav-link text-warning fw-bold d-flex align-items-center"
                  >
                    <img
                      src={
                        userData?.avatar_url ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="Avatar"
                      className="rounded-circle me-2"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    {userData?.full_name || user.displayName || user.email}
                  </Link>
                  <button
                    className={`btn btn-outline-light ${styles.logoutBtn}`}
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${styles.navLink}`} to="/login">
                    Đăng nhập
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${styles.navLink}`} to="/register">
                    Đăng ký
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navbar;

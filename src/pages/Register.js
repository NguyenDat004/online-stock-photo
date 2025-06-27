import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👁️ icon mắt

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });
      const token = await user.getIdToken();

      await axios.post("http://localhost:5000/api/auth/register", {
        token,
        fullName,
        email,
      });

      toast.success("🎉 Đăng ký thành công!", {
        position: "top-right",
        autoClose: 2000,
        onClose: () => navigate("/login"),
      });

      setError("");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      toast.error("Đăng ký thất bại. Email có thể đã được sử dụng.", {
        position: "top-right",
        autoClose: 2000,
      });
      setError("Đăng ký thất bại.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Đăng ký</h2>
      <div
        className="bg-white bg-opacity-75 shadow-lg rounded p-4 mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto"
          style={{ maxWidth: "400px" }}
        >
          {/* Họ và tên */}
          <div className="mb-3">
            <label className="form-label">Họ và tên:</label>
            <input
              type="text"
              className="form-control"
              name="fullName"
              placeholder="Nhập họ và tên..."
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Nhập email..."
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Mật khẩu */}
          <div className="mb-3 position-relative">
            <label className="form-label">Mật khẩu:</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              name="password"
              placeholder="Nhập mật khẩu..."
              value={formData.password}
              onChange={handleChange}
            />
            <span
              className="position-absolute"
              style={{
                top: "65%",
                right: "14px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Xác nhận mật khẩu */}
          <div className="mb-4 position-relative">
            <label className="form-label">Xác nhận mật khẩu:</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu..."
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <span
              className="position-absolute"
              style={{
                top: "65%",
                right: "14px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#666",
              }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Nút đăng ký */}
          <button type="submit" className="btn btn-success w-100">
            Đăng ký
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;

// src/pages/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios"; // Thêm axios
import { ToastContainer, toast } from "react-toastify"; // Thêm toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS toast

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      // Nếu thiếu thông tin
      toast.error("Vui lòng điền đầy đủ thông tin.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      // Nếu mật khẩu không khớp
      toast.error("Mật khẩu xác nhận không khớp.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Tạo user trên Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cập nhật displayName trên Firebase
      await updateProfile(user, {
        displayName: fullName,
      });

      // Lấy token từ Firebase
      const token = await user.getIdToken();

      // Gửi thông tin về backend để lưu vào PostgreSQL
      await axios.post("http://localhost:5000/api/auth/register", {
        token,
        fullName,
        email,
      });

      // Hiển thị thông báo thành công
      toast.success("🎉 Đăng ký thành công!", {
        position: "top-right",
        autoClose: 3000,
      });

      setError("");

      // Điều hướng sau khi toast hiển thị xong
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      // Hiển thị thông báo lỗi
      toast.error("Đăng ký thất bại. Email có thể đã được sử dụng.", {
        position: "top-right",
        autoClose: 3000,
      });
      setError("Đăng ký thất bại.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Đăng ký</h2>
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
        <div className="mb-3">
          <label className="form-label">Mật khẩu:</label>
          <input
            type="password"
            className="form-control"
            name="password"
            placeholder="Nhập mật khẩu..."
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {/* Xác nhận mật khẩu */}
        <div className="mb-4">
          <label className="form-label">Xác nhận mật khẩu:</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu..."
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {/* Nút đăng ký */}
        <button type="submit" className="btn btn-success w-100">
          Đăng ký
        </button>
      </form>

      {/* ToastContainer để hiển thị toast notification */}
      <ToastContainer />
    </div>
  );
}

export default Register;

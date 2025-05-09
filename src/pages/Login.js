import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        token,
      });

      toast.success("Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      toast.error("Đăng nhập thất bại. Kiểm tra email/mật khẩu.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Đăng nhập</h2>
      <form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ maxWidth: "400px" }}
      >
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

        <div className="mb-4">
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

        <button type="submit" className="btn btn-primary w-100">
          Đăng nhập
        </button>
      </form>

      {/* Container cho Toast */}
      <ToastContainer />
    </div>
  );
}

export default Login;

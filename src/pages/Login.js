import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔥 Đăng nhập Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();

      await axios.post("http://localhost:5000/api/auth/google", { token });

      toast.success("Đăng nhập Google thành công!", {
        autoClose: 800,
        onClose: () => navigate("/"),
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể đăng nhập bằng Google");
    }
  };

  // 🔥 Gửi email quên mật khẩu
  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.info("Nhập email để nhận mã khôi phục");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      toast.success("Đã gửi email đặt lại mật khẩu!");
    } catch (err) {
      toast.error("Email không tồn tại hoặc sai định dạng");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      await axios.post("http://localhost:5000/api/auth/login", { token });

      toast.success("Đăng nhập thành công!", {
        autoClose: 500,
        onClose: () => navigate("/"),
      });
    } catch (err) {
      toast.error("Sai email hoặc mật khẩu.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Đăng nhập</h2>
      <div className="bg-white shadow-lg rounded p-4 mx-auto" style={{ maxWidth: "400px" }}>
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              className="form-control"
              name="email"
              placeholder="Nhập email..."
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-4 position-relative">
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
                top: "70%",
                right: "14px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "18px",
                color: "#666",
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Quên mật khẩu */}
          <p
            className="text-primary"
            style={{ cursor: "pointer", fontSize: "14px" }}
            onClick={handleForgotPassword}
          >
            Quên mật khẩu?
          </p>

          {/* Nút Login */}
          <button type="submit" className="btn btn-primary w-100">
            Đăng nhập
          </button>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-danger w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google"
              style={{ width: "20px" }}
            />
            Đăng nhập bằng Google
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default Login;

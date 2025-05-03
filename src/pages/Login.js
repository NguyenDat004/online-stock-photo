// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      return setError('Vui lòng nhập đầy đủ thông tin.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();

      // Gửi token đến backend
      const res = await axios.post('http://localhost:5000/api/auth/login', { token });

      console.log('✅ Đăng nhập backend:', res.data);

      setError(''); // Xóa thông báo lỗi nếu có
      navigate('/'); // Chuyển hướng về trang chính sau khi đăng nhập thành công
    } catch (err) {
      console.error('❌ Lỗi đăng nhập:', err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Đăng nhập</h2>
      <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '400px' }}>
        {error && <div className="alert alert-danger">{error}</div>}

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

        <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
      </form>
    </div>
  );
}

export default Login;

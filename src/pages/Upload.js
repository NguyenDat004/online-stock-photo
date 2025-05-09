import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Upload() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    price: "",
    image: null,
  });

  const [status, setStatus] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        setCategories(res.data); // [{ id, name }]
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setStatus("❌ Vui lòng chọn ảnh để tải lên.");
      return;
    }

    try {
      setStatus("🚀 Đang tải ảnh lên...");

      const imageData = new FormData();
      imageData.append("file", formData.image);
      imageData.append("upload_preset", "StockPhoto");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dhwtef2u8/image/upload",
        imageData
      );

      const imageUrl = cloudinaryRes.data.secure_url;
      const token = await auth.currentUser.getIdToken();

      await axios.post(
        "http://localhost:5000/api/photos/upload",
        {
          title: formData.title,
          description: formData.description,
          category_id: parseInt(formData.category_id),
          price: parseInt(formData.price),
          imageUrl,
          uploader: auth.currentUser.uid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus("✅ Tải ảnh lên thành công!");
      localStorage.setItem("photo_uploaded", "true");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("❌ Upload thất bại:", err);
      setStatus("❌ Tải ảnh lên thất bại.");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4">Tải ảnh lên</h2>
      {status && (
        <div
          className={`alert ${
            status.includes("✅") ? "alert-success" : "alert-danger"
          }`}
        >
          {status}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          name="image"
          onChange={handleChange}
          required
          className="form-control mb-3"
        />
        <input
          type="text"
          name="title"
          onChange={handleChange}
          placeholder="Tiêu đề"
          required
          className="form-control mb-3"
        />
        <textarea
          name="description"
          onChange={handleChange}
          placeholder="Mô tả"
          required
          className="form-control mb-3"
        />

        <select
          name="category_id"
          onChange={handleChange}
          value={formData.category_id}
          required
          className="form-select mb-3"
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="price"
          onChange={handleChange}
          placeholder="Giá (VNĐ)"
          required
          className="form-control mb-4"
        />
        <button type="submit" className="btn btn-success w-100">
          Tải lên
        </button>
      </form>
    </div>
  );
}

export default Upload;

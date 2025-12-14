import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

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
        const res = await axios.get(
          "https://online-stock-photo.onrender.com/api/categories"
        );
        setCategories(res.data); // [{ id, name }]
      } catch (err) {
        console.error("Lỗi khi lấy danh mục:", err);
      }
    };

    fetchCategories();
  }, []);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const COMPRESS_TARGET = 1.5; // MB

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      let file = files[0];

      // Bước 1: Nếu ảnh > 2MB thì nén về dưới 2MB
      if (file.size > COMPRESS_TARGET * 1024 * 1024) {
        setStatus("📦 Đang nén ảnh...");

        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: COMPRESS_TARGET,
            maxWidthOrHeight: 1500,
            useWebWorker: true,
          });

          console.log("Kích thước sau nén:", compressedFile.size);

          if (compressedFile.size > MAX_FILE_SIZE) {
            setStatus(
              "❌ Ảnh sau khi nén vẫn lớn hơn 10MB. Vui lòng chọn ảnh khác."
            );
            return;
          }

          file = compressedFile;
          setStatus("✅ Ảnh đã được nén và sẵn sàng tải lên.");
        } catch (err) {
          console.error("❌ Lỗi khi nén ảnh:", err);
          setStatus("❌ Lỗi khi nén ảnh. Vui lòng thử lại.");
          return;
        }
      }

      // Bước 2: Set file (đã nén nếu cần)
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      // Các input khác
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  //
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setStatus("❌ Vui lòng chọn ảnh để tải lên.");
      return;
    }

    try {
      setStatus("🚀 Đang tải ảnh lên...");

      const token = await auth.currentUser.getIdToken();

      const imageData = new FormData();
      imageData.append("image", formData.image);
      imageData.append("title", formData.title);
      imageData.append("description", formData.description);
      imageData.append("category_id", parseInt(formData.category_id));
      imageData.append("price", parseInt(formData.price));
      imageData.append("uploader", auth.currentUser.uid);

      await axios.post(
        "https://online-stock-photo.onrender.com/api/photos/upload",
        imageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setStatus("✅ Tải ảnh lên thành công!");
      localStorage.setItem("photo_uploaded", "true");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi không xác định";
      const errorDetail = err.response?.data?.detail || "";
      console.error("❌ Upload thất bại:", errorMsg, errorDetail);
      setStatus(`❌ Tải ảnh lên thất bại: ${errorMsg}`);
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
        {formData.image && (
          <small className="text-muted">
            📁 {formData.image.name} -{" "}
            {(formData.image.size / (1024 * 1024)).toFixed(2)} MB
          </small>
        )}

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

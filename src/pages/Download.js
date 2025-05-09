import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS toast

function Download() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const token = await user.getIdToken();

        const res = await axios.get(
          `http://localhost:5000/api/downloads/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPhotos(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách ảnh đã mua:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  // 🔽 Hàm tải ảnh về máy
  const handleDownload = async (url, filename = "photo.jpg") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
      // Hiển thị thông báo thành công
      toast.success(` Đã tải "${filename}" thành công!`, {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("❌ Lỗi khi tải ảnh:", err);
      toast.error("❌ Không thể tải ảnh. Vui lòng thử lại.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  if (loading)
    return <div className="container py-5">Đang tải ảnh đã mua...</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">📦 Ảnh bạn đã mua</h2>
      {photos.length === 0 ? (
        <p>Bạn chưa mua ảnh nào.</p>
      ) : (
        <div className="row">
          {photos.map((photo) => (
            <div
              key={`${photo.photo_id}-${photo.image_url}`}
              className="col-md-3 mb-4"
            >
              <div className="card h-100 shadow-sm">
                <img
                  src={photo.image_url}
                  className="card-img-top"
                  alt={photo.title}
                  style={{ height: "200px", objectFit: "cover" }}
                  onContextMenu={(e) => e.preventDefault()} // Chặn chuột phải
                  onDragStart={(e) => e.preventDefault()} // Chặn kéo thả
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{photo.title}</h5>
                  <p className="card-text">
                    {Number(photo.price).toLocaleString()} VNĐ
                  </p>
                  <button
                    className="btn btn-primary mt-auto"
                    onClick={() =>
                      handleDownload(photo.image_url, `${photo.title}.jpg`)
                    }
                  >
                    Tải xuống
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ToastContainer /> {/* Thêm ToastContainer để hiển thị thông báo */}
    </div>
  );
}

export default Download;

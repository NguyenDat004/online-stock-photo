import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Download() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Số ảnh mỗi trang

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

    return () => unsubscribe();
  }, []);

  // 🔽 Tải ảnh gốc
  const handleDownload = async (photoId, filename) => {
    try {
      const token = await auth.currentUser.getIdToken();

      const res = await axios.get(
        `http://localhost:5000/api/photos/${photoId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const url = res.data.download_url;

      const blob = await fetch(url).then((r) => r.blob());
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(blobUrl);

      toast.success(`Đã tải "${filename}" thành công!`, {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("❌ Lỗi khi tải ảnh:", err);
      toast.error("Không thể tải ảnh. Vui lòng thử lại.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPhotos = photos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(photos.length / itemsPerPage);

  // Chuyển trang
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Tạo danh sách số trang hiển thị
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5; // Số trang tối đa hiển thị

    if (totalPages <= maxVisible) {
      // Hiển thị tất cả nếu ít trang
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Hiển thị có dấu ...
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++)
          pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải ảnh đã mua...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📦 Ảnh bạn đã mua</h2>
        {photos.length > 0 && (
          <span className="badge bg-primary fs-6">{photos.length} ảnh</span>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📷</div>
          <h4 className="text-muted">Bạn chưa mua ảnh nào.</h4>
        </div>
      ) : (
        <>
          <div className="row">
            {currentPhotos.map((photo) => (
              <div
                key={`${photo.photo_id}`}
                className="col-lg-3 col-md-4 col-sm-6 mb-4"
              >
                <div className="card h-100 shadow-sm">
                  <img
                    src={photo.image_url} // Ảnh watermark
                    className="card-img-top"
                    alt={photo.title}
                    style={{ height: "200px", objectFit: "cover" }}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{photo.title}</h5>
                    <p className="card-text">
                      {Number(photo.price).toLocaleString()} VNĐ
                    </p>

                    <button
                      className="btn btn-primary mt-auto"
                      onClick={() =>
                        handleDownload(photo.photo_id, `${photo.title}.jpg`)
                      }
                    >
                      📥 Tải xuống
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                {/* Nút Previous */}
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹ Trước
                  </button>
                </li>

                {/* Các số trang */}
                {getPageNumbers().map((number, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      number === currentPage ? "active" : ""
                    } ${number === "..." ? "disabled" : ""}`}
                  >
                    {number === "..." ? (
                      <span className="page-link">...</span>
                    ) : (
                      <button
                        className="page-link"
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    )}
                  </li>
                ))}

                {/* Nút Next */}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau ›
                  </button>
                </li>
              </ul>

              {/* Thông tin trang */}
              <div className="text-center text-muted mt-2">
                Trang {currentPage} / {totalPages} (Hiển thị{" "}
                {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, photos.length)} trong tổng số{" "}
                {photos.length} ảnh)
              </div>
            </nav>
          )}
        </>
      )}

      <ToastContainer />
    </div>
  );
}

export default Download;

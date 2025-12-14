import React, { useEffect, useState } from "react";

const AdminPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Edit Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    description: "",
    price: 0,
  });

  // Categories từ database
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchPhotos();
    fetchCategories();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/photos/all-admin");

      if (!res.ok) throw new Error("Không thể tải danh sách ảnh");

      const data = await res.json();
      setPhotos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách categories từ database
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories");
      if (!res.ok) throw new Error("Không thể tải danh mục");

      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi khi tải categories:", err);
    }
  };

  // -----------------------
  // MỞ MODAL CHỈNH SỬA
  // -----------------------
  const openEditModal = (photo) => {
    setEditingPhoto(photo);

    // Kiểm tra xem category hiện tại có trong danh sách categories không
    const categoryExists = categories.some(
      (cat) => cat.name === photo.category
    );

    setEditForm({
      title: photo.title || "",
      // Nếu category không tồn tại trong dropdown hoặc là "N/A", set thành rỗng để bắt chọn lại
      category:
        categoryExists && photo.category !== "N/A" ? photo.category : "",
      description: photo.description || "",
      price: photo.price || 0,
    });
    setShowEditModal(true);
  };

  // -----------------------
  // ĐÓNG MODAL
  // -----------------------
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingPhoto(null);
    setEditForm({
      title: "",
      category: "",
      description: "",
      price: 0,
    });
  };

  // -----------------------
  // CẬP NHẬT ẢNH
  // -----------------------
  const handleUpdatePhoto = async (e) => {
    e.preventDefault();

    console.log("📤 Sending update:", editForm);

    try {
      const res = await fetch(
        `http://localhost:5000/api/photos/${editingPhoto.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Backend error:", errorData);
        throw new Error(errorData.message || "Cập nhật thất bại");
      }

      const responseData = await res.json();
      console.log("✅ Backend response:", responseData);

      // Cập nhật state - giữ nguyên category trong state local
      setPhotos((prev) =>
        prev.map((p) => (p.id === editingPhoto.id ? { ...p, ...editForm } : p))
      );

      alert("✅ Cập nhật ảnh thành công!");
      closeEditModal();

      // Reload lại data từ server để đảm bảo đồng bộ
      fetchPhotos();
    } catch (err) {
      console.error("❌ Update error:", err);
      alert("❌ " + err.message);
    }
  };

  // -----------------------
  // XÓA ẢNH
  // -----------------------
  const deletePhoto = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa ảnh này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/photos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Xóa thất bại");

      setPhotos((prev) => prev.filter((p) => p.id !== id));
      alert("Đã xóa ảnh!");
    } catch (err) {
      alert(err.message);
    }
  };

  // -----------------------
  // DUYỆT ẢNH (Chờ duyệt -> Đã duyệt)
  // -----------------------
  const approvePhoto = async (id) => {
    if (!window.confirm("Bạn có chắc muốn duyệt ảnh này?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/photos/${id}/approve`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) throw new Error("Duyệt thất bại");

      const data = await res.json();

      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "Đã duyệt" } : p))
      );
      alert(data.message);
    } catch (err) {
      alert(err.message);
    }
  };

  // Format tiền
  const formatCurrency = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v || 0);

  // -----------------------
  // PAGINATION LOGIC
  // -----------------------
  const totalPages = Math.ceil(photos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPhotos = photos.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset về trang 1
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  // UI Loading
  if (loading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border"></div>
        <p>Đang tải ảnh...</p>
      </div>
    );
  }

  // UI Error
  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        <strong>Lỗi: </strong> {error}
        <button className="btn btn-primary btn-sm ms-3" onClick={fetchPhotos}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📸 Quản lý ảnh</h2>
        <button className="btn btn-outline-primary" onClick={fetchPhotos}>
          🔄 Làm mới
        </button>
      </div>

      {/* Stats & Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, photos.length)}{" "}
            trong tổng số {photos.length} ảnh
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="mb-0 me-2">Hiển thị:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-muted">/ trang</span>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Lượt bán</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {currentPhotos.map((photo, index) => (
                  <tr key={photo.id}>
                    <td>{startIndex + index + 1}</td>

                    <td>
                      <img
                        src={
                          photo.image_url || "https://via.placeholder.com/60"
                        }
                        alt={photo.title}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "5px",
                        }}
                      />
                    </td>

                    <td>{photo.title}</td>

                    <td>
                      <span className="badge bg-info">
                        {photo.category && photo.category !== "N/A"
                          ? photo.category
                          : "N/A"}
                      </span>
                    </td>

                    <td className="fw-bold text-success">
                      {formatCurrency(photo.price)}
                    </td>

                    <td>
                      <strong className="text-primary">
                        {photo.sold || 0}
                      </strong>
                    </td>

                    <td>
                      {photo.status === "Đã duyệt" ? (
                        <span className="badge bg-success">✓ Đã duyệt</span>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => approvePhoto(photo.id)}
                        >
                          ⏳ Duyệt ngay
                        </button>
                      )}
                    </td>

                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openEditModal(photo)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deletePhoto(photo.id)}
                        >
                          🗑 Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {photos.length === 0 && (
              <p className="text-center text-muted mt-3">Không có ảnh nào.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <nav>
            <ul className="pagination mb-0">
              {/* Previous Button */}
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹ Trước
                </button>
              </li>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    page === currentPage ? "active" : ""
                  } ${page === "..." ? "disabled" : ""}`}
                >
                  {page === "..." ? (
                    <span className="page-link">...</span>
                  ) : (
                    <button
                      className="page-link"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )}
                </li>
              ))}

              {/* Next Button */}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau ›
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">✏️ Chỉnh sửa ảnh</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEditModal}
                ></button>
              </div>

              <form onSubmit={handleUpdatePhoto}>
                <div className="modal-body">
                  {/* Preview ảnh */}
                  {editingPhoto?.image_url && (
                    <div className="text-center mb-3">
                      <img
                        src={editingPhoto.image_url}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  )}

                  {/* Tiêu đề */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Tiêu đề <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Danh mục - Dropdown từ database */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Danh mục <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {editingPhoto?.category &&
                      editingPhoto.category !== "N/A" &&
                      !categories.some(
                        (cat) => cat.name === editingPhoto.category
                      ) && (
                        <div
                          className="alert alert-warning mt-2 mb-0"
                          role="alert"
                        >
                          <small>
                            ⚠️ Danh mục hiện tại "{editingPhoto.category}" không
                            có trong danh sách. Vui lòng chọn danh mục mới.
                          </small>
                        </div>
                      )}
                  </div>

                  {/* Mô tả */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Mô tả</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Nhập mô tả chi tiết về ảnh..."
                    />
                  </div>

                  {/* Giá */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Giá (VNĐ) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: Number(e.target.value),
                        })
                      }
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeEditModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    💾 Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPhotos;

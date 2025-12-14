import React, { useEffect, useState } from "react";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://online-stock-photo.onrender.com/api/categories"
      );
      if (!res.ok) throw new Error("Không thể tải danh sách danh mục");

      const data = await res.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditMode(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: "", description: "" });
    setCurrentCategory(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      const res = await fetch(
        "https://online-stock-photo.onrender.com/api/categories",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Thêm danh mục thất bại");

      const newCategory = await res.json();
      setCategories((prev) => [...prev, newCategory]);
      alert("✅ Đã thêm danh mục mới!");
      closeModal();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }

    try {
      const res = await fetch(
        `https://online-stock-photo.onrender.com/api/categories/${currentCategory.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Cập nhật thất bại");

      const updatedCategory = await res.json();
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === currentCategory.id ? updatedCategory : cat
        )
      );
      alert("✅ Đã cập nhật danh mục!");
      closeModal();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;

    try {
      const res = await fetch(
        `https://online-stock-photo.onrender.com/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Xóa thất bại");

      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      alert("✅ Đã xóa danh mục!");
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  const handleSubmit = () => {
    if (editMode) {
      handleUpdate();
    } else {
      handleAdd();
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

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

  if (loading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border"></div>
        <p>Đang tải danh mục...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        <strong>Lỗi: </strong> {error}
        <button
          className="btn btn-primary btn-sm ms-3"
          onClick={fetchCategories}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">📁 Quản lý danh mục</h2>
        <div>
          <button
            className="btn btn-outline-primary me-2"
            onClick={fetchCategories}
          >
            🔄 Làm mới
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            ➕ Thêm danh mục
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, categories.length)}{" "}
            trong tổng số {categories.length} danh mục
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
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Số ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {currentCategories.map((category, index) => (
                  <tr key={category.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      <strong className="text-primary">{category.name}</strong>
                    </td>
                    <td>{category.description || "Chưa có mô tả"}</td>
                    <td>
                      <span className="badge bg-info">
                        {category.photo_count || 0} ảnh
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => openEditModal(category)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category.id)}
                      >
                        🗑 Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categories.length === 0 && (
              <p className="text-center text-muted mt-3">
                Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
              </p>
            )}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <nav>
            <ul className="pagination mb-0">
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

      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "✏️ Sửa danh mục" : "➕ Thêm danh mục mới"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Tên danh mục <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Phong cảnh, Chân dung..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Mô tả</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Mô tả ngắn về danh mục..."
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                >
                  {editMode ? "💾 Cập nhật" : "➕ Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

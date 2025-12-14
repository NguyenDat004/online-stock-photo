import React, { useEffect, useState } from "react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/users");
      if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
      const data = await res.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({ full_name: user.full_name || "" });
    setAvatarFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentUser(null);
    setFormData({ full_name: "" });
    setAvatarFile(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleUpdate = async () => {
    if (!formData.full_name.trim()) {
      alert("Vui lòng nhập tên đầy đủ!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: formData.full_name })
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      if (avatarFile) {
        const avatarData = new FormData();
        avatarData.append("avatar", avatarFile);

        const avatarRes = await fetch(
          `http://localhost:5000/api/users/${currentUser.uid}/avatar`,
          {
            method: "PUT",
            body: avatarData
          }
        );

        if (!avatarRes.ok) throw new Error("Upload avatar thất bại");
      }

      alert("✅ Cập nhật thành công!");
      fetchUsers();
      closeModal();
    } catch (err) {
      alert("❌ Lỗi khi cập nhật user: " + err.message);
    }
  };

  const handleDelete = async (uid) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${uid}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Xóa thất bại");

      alert("✅ Đã xóa user!");
      setUsers(users.filter((u) => u.uid !== uid));
    } catch (err) {
      alert("❌ Lỗi khi xóa user: " + err.message);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

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
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="text-center mt-4">Đang tải...</div>;
  if (error)
    return (
      <div className="alert alert-danger mt-4">
        <strong>Lỗi:</strong> {error}{" "}
        <button className="btn btn-primary btn-sm" onClick={fetchUsers}>
          Thử lại
        </button>
      </div>
    );

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">👤 Quản lý người dùng</h2>
        <button className="btn btn-outline-primary" onClick={fetchUsers}>
          🔄 Làm mới
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, users.length)} trong tổng số {users.length} người dùng
          </span>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <label className="mb-0 me-2">Hiển thị:</label>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
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
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Avatar</th>
                <th>Họ & Tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <tr key={user.uid}>
                  <td>{startIndex + index + 1}</td>
                  <td>
                    <img
                      src={user.avatar_url || "/default-avatar.png"}
                      alt="avatar"
                      className="rounded-circle"
                      width="40"
                      height="40"
                    />
                  </td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => openEditModal(user)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user.uid)}
                    >
                      🗑 Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
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
                  className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                >
                  {page === '...' ? (
                    <span className="page-link">...</span>
                  ) : (
                    <button className="page-link" onClick={() => goToPage(page)}>
                      {page}
                    </button>
                  )}
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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
                <h5 className="modal-title">✏️ Cập nhật người dùng</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Họ & Tên</label>
                  <input
                    type="text"
                    className="form-control"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Avatar</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleAvatarChange}
                    accept="image/*"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleUpdate}>
                  💾 Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
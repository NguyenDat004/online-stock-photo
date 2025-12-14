import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionItems, setTransactionItems] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search, transactions]);

  // Fetch All Transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/transactions/all");

      if (!res.ok) throw new Error("Không thể tải danh sách đơn hàng");

      const data = await res.json();
      setTransactions(data || []);
      setFiltered(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const handleSearch = () => {
    const s = search.toLowerCase();

    const result = transactions.filter((t) =>
      t.transaction_id.toString().includes(s) ||
      (t.user_id || "").toLowerCase().includes(s) ||
      (t.full_name || "").toLowerCase().includes(s)
    );

    setFiltered(result);
    setCurrentPage(1);
  };

  // View details
  const viewDetails = async (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
    setLoadingDetails(true);

    try {
      const res = await fetch(
        `http://localhost:5000/api/transactions/${transaction.transaction_id}`
      );

      if (!res.ok) throw new Error("Không thể tải chi tiết đơn hàng");

      const data = await res.json();
      setTransactionItems(data.items || []);
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedTransaction(null);
    setTransactionItems([]);
  };

  // Helpers
  const formatCurrency = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v || 0);

  const formatDate = (d) => {
    if (!d) return "...";
    const date = new Date(d);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadge = (status) => {
    return status === "success" ? (
      <span className="badge bg-success">✓ Thành công</span>
    ) : (
      <span className="badge bg-warning">⏳ Đang xử lý</span>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentTransactions = filtered.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
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

    return pages;
  };

  const totalRevenue = filtered.reduce(
    (sum, t) => sum + parseFloat(t.total_price || 0),
    0
  );

  // Export Excel
  const exportExcel = () => {
    const wsData = filtered.map((t) => ({
      "Mã đơn": t.transaction_id,
      "Tên khách": t.full_name || "Không rõ",
      "User ID": t.user_id,
      "Tổng tiền": t.total_price,
      "Số lượng ảnh": t.total_items,
      "Trạng thái": t.status,
      "Ngày tạo": formatDate(t.created_at),
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Doanh thu");
    XLSX.writeFile(wb, "bao_cao_doanh_thu.xlsx");
  };

  // UI Loading
  if (loading) {
    return (
      <div className="text-center mt-4">
        <div className="spinner-border"></div>
        <p>Đang tải đơn hàng...</p>
      </div>
    );
  }

  // UI Error
  if (error) {
    return (
      <div className="alert alert-danger mt-4">
        <strong>Lỗi:</strong> {error}
        <button className="btn btn-primary btn-sm ms-3" onClick={fetchTransactions}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">💳 Quản lý đơn hàng</h2>

        <div>
          <input
            type="text"
            className="form-control d-inline-block me-2"
            placeholder="🔍 Tìm theo mã đơn / tên / user_id..."
            style={{ width: "260px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-success me-2" onClick={exportExcel}>📊 Xuất Excel</button>
          <button className="btn btn-outline-primary" onClick={fetchTransactions}>🔄 Làm mới</button>
        </div>
      </div>

      {/* Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Tổng đơn hàng</h6>
              <h3 className="fw-bold text-primary">{filtered.length}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Tổng doanh thu</h6>
              <h3 className="fw-bold text-success">{formatCurrency(totalRevenue)}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-1">Đơn thành công</h6>
              <h3 className="fw-bold text-info">
                {filtered.filter((t) => t.status === "success").length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          Hiển thị {startIndex + 1} -{" "}
          {Math.min(startIndex + itemsPerPage, filtered.length)} /{" "}
          {filtered.length}
        </span>

        <div className="d-flex align-items-center">
          <label className="me-2">Hiển thị:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="ms-2 text-muted">/ trang</span>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>User ID</th>
                  <th>Số lượng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {currentTransactions.map((t) => (
                  <tr key={t.transaction_id}>
                    <td><span className="badge bg-secondary">#{t.transaction_id}</span></td>
                    <td><strong>{t.full_name || "Không rõ"}</strong></td>
                    <td className="text-muted">{t.user_id}</td>

                    <td><span className="badge bg-info">{t.total_items} ảnh</span></td>

                    <td className="fw-bold text-success">
                      {formatCurrency(t.total_price)}
                    </td>

                    <td>{statusBadge(t.status)}</td>
                    <td className="text-muted">{formatDate(t.created_at)}</td>

                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => viewDetails(t)}
                      >
                        👁️ Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="text-center text-muted mt-3">Không có kết quả</p>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 && "disabled"}`}>
                <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
                  ‹ Trước
                </button>
              </li>

              {getPageNumbers().map((page, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    page === currentPage ? "active" : ""
                  } ${page === "..." ? "disabled" : ""}`}
                >
                  {page === "..." ? (
                    <span className="page-link">...</span>
                  ) : (
                    <button className="page-link" onClick={() => goToPage(page)}>
                      {page}
                    </button>
                  )}
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
                <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
                  Sau ›
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modal */}
      {showDetailModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">📦 Chi tiết đơn #{selectedTransaction?.transaction_id}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body">
                <h6 className="fw-bold mb-3">Thông tin đơn hàng</h6>

                <div className="row">
                  <div className="col-md-6 mb-2"><strong>Mã đơn:</strong> #{selectedTransaction?.transaction_id}</div>
                  <div className="col-md-6 mb-2"><strong>Khách hàng:</strong> {selectedTransaction?.full_name}</div>

                  <div className="col-md-6 mb-2"><strong>User ID:</strong> {selectedTransaction?.user_id}</div>

                  <div className="col-md-6 mb-2">
                    <strong>Số lượng:</strong> {selectedTransaction?.total_items} ảnh
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Tổng tiền:</strong>
                    <span className="text-success fw-bold">
                      {formatCurrency(selectedTransaction?.total_price)}
                    </span>
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Trạng thái:</strong> {statusBadge(selectedTransaction?.status)}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Thời gian:</strong> {formatDate(selectedTransaction?.created_at)}
                  </div>
                </div>

                <hr />

                <h6 className="fw-bold mb-3">Ảnh đã mua</h6>

                {loadingDetails ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm"></div>
                    <p className="mt-2">Đang tải...</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Ảnh</th>
                          <th>Tiêu đề</th>
                          <th>Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactionItems.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <img
                                src={item.image_url}
                                alt={item.title}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                }}
                              />
                            </td>
                            <td>{item.title}</td>
                            <td className="text-success fw-bold">
                              {formatCurrency(item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Đóng</button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTransactions;

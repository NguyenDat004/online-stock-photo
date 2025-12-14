import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueView, setRevenueView] = useState("month"); // 'month' or 'day'

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log("📊 Fetching dashboard stats...");

      const response = await fetch("http://localhost:5000/api/admin/dashboard");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Stats received:", data);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
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

  // Loading state
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">❌ Lỗi!</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <button className="btn btn-primary" onClick={fetchStats}>
              🔄 Thử lại
            </button>
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="text-center mt-5">
        <p>Không có dữ liệu</p>
        <button className="btn btn-primary" onClick={fetchStats}>
          🔄 Tải lại
        </button>
      </div>
    );
  }

  const {
    overview,
    revenueByMonth,
    revenueByDay,
    topPhotos,
    topCategories,
    topCustomers,
    recentTransactions,
    newUsers,
    revenueComparison,
  } = stats;

  return (
    <div
      className="container-fluid p-4"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">📊 Bảng điều khiển</h2>
        <button className="btn btn-outline-primary btn-sm" onClick={fetchStats}>
          🔄 Làm mới
        </button>
      </div>

      {/* ======== THỐNG KÊ TỔNG QUAN ========= */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">📸 Tổng số ảnh</h6>
                  <h3 className="fw-bold mb-0">{overview?.totalPhotos || 0}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <span className="fs-4">📸</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">📁 Danh mục</h6>
                  <h3 className="fw-bold mb-0">
                    {overview?.totalCategories || 0}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <span className="fs-4">📁</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">👥 Người dùng</h6>
                  <h3 className="fw-bold mb-0">{overview?.totalUsers || 0}</h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <span className="fs-4">👥</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">💰 Tổng doanh thu</h6>
                  <h3 className="fw-bold mb-0 text-success">
                    {formatCurrency(overview?.totalRevenue || 0)}
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <span className="fs-4">💰</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======== THỐNG KÊ GIAO DỊCH ========= */}
      <div className="row g-3 mb-4">
        <div className="col-lg-4 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted mb-2">📦 Tổng giao dịch</h6>
              <h3 className="fw-bold">{overview?.totalTransactions || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted mb-2">⏳ Đơn hàng chờ</h6>
              <h3 className="fw-bold text-warning">
                {overview?.pendingOrders || 0}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted mb-2">📈 Tăng trưởng doanh thu</h6>
              <h3
                className={`fw-bold ${
                  revenueComparison?.growth?.revenue >= 0
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {revenueComparison?.growth?.revenue?.toFixed(1) || 0}%
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ======== SO SÁNH DOANH THU ========= */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">📊 Doanh thu tháng này</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Doanh thu:</span>
                <strong>
                  {formatCurrency(
                    revenueComparison?.currentMonth?.revenue || 0
                  )}
                </strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Đơn hàng:</span>
                <strong>{revenueComparison?.currentMonth?.orders || 0}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="mb-3">📊 Doanh thu tháng trước</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Doanh thu:</span>
                <strong>
                  {formatCurrency(
                    revenueComparison?.previousMonth?.revenue || 0
                  )}
                </strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Đơn hàng:</span>
                <strong>{revenueComparison?.previousMonth?.orders || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======== BIỂU ĐỒ DOANH THU (GỘP VỚI DROPDOWN) ======== */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">📈 Biểu đồ doanh thu</h4>
          <select
            className="form-select"
            style={{ width: "auto" }}
            value={revenueView}
            onChange={(e) => setRevenueView(e.target.value)}
          >
            <option value="month">12 tháng gần nhất</option>
            <option value="day">30 ngày gần nhất</option>
          </select>
        </div>

        {revenueView === "month" ? (
          revenueByMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0d6efd"
                  strokeWidth={3}
                  name="Doanh thu"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#198754"
                  strokeWidth={2}
                  name="Số đơn"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted">Chưa có dữ liệu doanh thu</p>
          )
        ) : revenueByDay?.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#0d6efd" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted">Chưa có dữ liệu</p>
        )}
      </div>

      {/* ======== TOP 10 ẢNH BÁN CHẠY ======== */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <h4 className="mb-3">🔥 Top 10 ảnh bán chạy nhất</h4>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Hình ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Đã bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topPhotos?.map((photo, index) => (
                <tr key={photo.id}>
                  <td>{index + 1}</td>
                  <td>
                    <img
                      src={photo.thumbnail || "https://via.placeholder.com/50"}
                      alt={photo.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td>{photo.title}</td>
                  <td>
                    <span className="badge bg-info">
                      {photo.category || "N/A"}
                    </span>
                  </td>
                  <td>{formatCurrency(photo.price)}</td>
                  <td>
                    <strong>{photo.sold}</strong>
                  </td>
                  <td className="text-success fw-bold">
                    {formatCurrency(photo.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======== TOP DANH MỤC & KHÁCH HÀNG ======== */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-3 h-100">
            <h4 className="mb-3">📁 Top 5 danh mục bán chạy</h4>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Tổng ảnh</th>
                    <th>Đã bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {topCategories?.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <strong>{cat.name}</strong>
                      </td>
                      <td>{cat.totalPhotos}</td>
                      <td>{cat.sold}</td>
                      <td className="text-success">
                        {formatCurrency(cat.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-3 h-100">
            <h4 className="mb-3">👑 Top 5 khách hàng VIP</h4>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Đơn hàng</th>
                    <th>Số ảnh</th>
                    <th>Chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers?.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              customer.avatar ||
                              "https://via.placeholder.com/30"
                            }
                            alt={customer.fullName}
                            className="rounded-circle me-2"
                            style={{
                              width: "30px",
                              height: "30px",
                              objectFit: "cover",
                            }}
                          />
                          <span>{customer.fullName}</span>
                        </div>
                      </td>
                      <td>{customer.orders}</td>
                      <td>{customer.items}</td>
                      <td className="text-success fw-bold">
                        {formatCurrency(customer.spent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ======== GIAO DỊCH GẦN ĐÂY & NGƯỜI DÙNG MỚI ======== */}

      {/* ======== GIAO DỊCH GÀN ĐÂY ======== */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <h4 className="mb-3">🕒 10 giao dịch gần nhất</h4>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người mua</th>
                <th>Email</th>
                <th>Số ảnh</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions?.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <strong>#{tx.id}</strong>
                  </td>
                  <td>{tx.fullName}</td>
                  <td>{tx.email}</td>
                  <td>{tx.items}</td>
                  <td className="fw-bold">{formatCurrency(tx.totalPrice)}</td>
                  <td>
                    <span
                      className={`badge ${
                        tx.status === "success"
                          ? "bg-success"
                          : tx.status === "pending"
                          ? "bg-warning"
                          : "bg-danger"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td>{formatDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======== NGƯỜI DÙNG MỚI ======== */}
      <div className="card shadow-sm border-0 p-3">
        <h4 className="mb-3">👥 Người dùng mới (30 ngày)</h4>
        {newUsers?.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={newUsers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newUsers" fill="#17a2b8" name="Người dùng mới" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted">Chưa có dữ liệu</p>
        )}
      </div>

      {/* Footer timestamp */}
      <div className="text-center mt-4 text-muted">
        <small>Cập nhật lần cuối: {formatDate(stats.timestamp)}</small>
      </div>
    </div>
  );
};

export default Dashboard;

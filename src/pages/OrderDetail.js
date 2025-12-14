import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";

function OrderDetail() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.warning("⚠️ Vui lòng đăng nhập!");
        navigate("/login");
        return;
      }

      const token = await user.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrderInfo(response.data.transaction);
      setOrderItems(response.data.items);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching order detail:", error.message);
      toast.error("❌ Lỗi khi lấy chi tiết đơn hàng!");
      setLoading(false);
    }
  }, [transactionId, navigate]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải chi tiết đơn hàng...</p>
      </Container>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
    >
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2">
              📦 Chi tiết đơn hàng #{transactionId}
            </h2>
            <p className="text-muted mb-0">
              Xem thông tin chi tiết và tải về các ảnh đã mua
            </p>
          </div>
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/orders")}
            className="d-flex align-items-center gap-2"
          >
            ← Quay lại
          </Button>
        </div>

        {/* Order Info Card */}
        {orderInfo && (
          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <h6 className="text-muted mb-2">Mã đơn hàng</h6>
                  <p className="fw-bold mb-0">#{orderInfo.transaction_id}</p>
                </Col>
                <Col md={3}>
                  <h6 className="text-muted mb-2">Ngày đặt</h6>
                  <p className="mb-0">{formatDate(orderInfo.created_at)}</p>
                </Col>
                <Col md={3}>
                  <h6 className="text-muted mb-2">Số lượng</h6>
                  <p className="mb-0">
                    <Badge bg="info">{orderItems.length} ảnh</Badge>
                  </p>
                </Col>
                <Col md={3}>
                  <h6 className="text-muted mb-2">Tổng tiền</h6>
                  <p className="fw-bold text-success mb-0">
                    {formatCurrency(orderInfo.total_price)}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Photos Section */}
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h5 className="fw-bold mb-4">
              Danh sách ảnh đã mua ({orderItems.length})
            </h5>

            {orderItems.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: "3rem" }}>📷</div>
                <p className="text-muted mt-3">
                  Không có ảnh nào trong đơn hàng này
                </p>
              </div>
            ) : (
              <Row className="g-4">
                {orderItems.map((item) => (
                  <Col lg={4} md={6} key={item.photo_id}>
                    <Card
                      className="h-100 shadow-sm border-0 hover-shadow"
                      style={{ transition: "transform 0.2s, box-shadow 0.2s" }}
                    >
                      <div
                        style={{
                          height: "280px",
                          overflow: "hidden",
                          backgroundColor: "#f0f0f0",
                        }}
                      >
                        <Card.Img
                          variant="top"
                          src={
                            item.image_url ||
                            "https://via.placeholder.com/400x280?text=No+Image"
                          }
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/400x280?text=Image+Error";
                          }}
                        />
                      </div>

                      <Card.Body className="d-flex flex-column">
                        <Card.Title
                          className="fw-bold mb-2"
                          style={{
                            fontSize: "1.1rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title}
                        </Card.Title>

                        <Card.Text
                          className="text-muted mb-2"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Ngày mua:{" "}
                          {formatDate(item.created_at || orderInfo?.created_at)}
                        </Card.Text>

                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <div
                            className="fw-bold text-success"
                            style={{ fontSize: "1.1rem" }}
                          >
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Bottom Action */}
        <div className="text-center mt-4">
          <Button
            variant="outline-primary"
            size="lg"
            onClick={() => navigate("/orders")}
            className="px-5"
          >
            ← Quay lại danh sách đơn hàng
          </Button>
        </div>
      </Container>

      <style>{`
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
}

export default OrderDetail;

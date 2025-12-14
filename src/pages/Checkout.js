import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ListGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.warning("⚠️ Vui lòng đăng nhập!");
        navigate("/login");
        return;
      }

      const token = await user.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/cart/${user.uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCartItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Lỗi khi lấy giỏ hàng:", err);
      toast.error("Không thể tải giỏ hàng!");
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // ⭐⭐ THANH TOÁN QUA VNPAY (ĐÃ SỬA) ⭐⭐
  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const user = auth.currentUser;

      if (!user) {
        toast.error("Vui lòng đăng nhập!");
        navigate("/login");
        return;
      }

      if (cartItems.length === 0) {
        toast.warning("Giỏ hàng trống!");
        return;
      }

      const token = await user.getIdToken();

      // Gửi danh sách giỏ hàng sang VNPay API
      const res = await axios.post(
        "http://localhost:5000/api/vnpay/create-payment",
        {
          userId: user.uid,
          items: cartItems.map((item) => ({
            photo_id: item.photo_id,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice: calculateTotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Redirect sang VNPay
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      console.error("❌ Lỗi khi tạo thanh toán VNPay:", err);
      toast.error("Không thể tạo thanh toán VNPay!");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRemoveItem = async (photoId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await axios.delete(
        `http://localhost:5000/api/cart/${user.uid}/${photoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("🗑️ Đã xóa khỏi giỏ hàng!");
      fetchCart();
    } catch (err) {
      console.error("❌ Lỗi khi xóa:", err);
      toast.error("Không thể xóa ảnh!");
    }
  };

  const handleUpdateQuantity = async (photoId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await axios.put(
        `http://localhost:5000/api/cart/${user.uid}/${photoId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("✔️ Đã cập nhật số lượng!");
      fetchCart();
    } catch (err) {
      console.error("❌ Lỗi khi cập nhật:", err);
      toast.error("Không thể cập nhật số lượng!");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải giỏ hàng...</p>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="mt-5">
        <Alert variant="info" className="text-center">
          <h4>🛒 Giỏ hàng trống</h4>
          <p>Hãy thêm ảnh vào giỏ hàng để tiếp tục mua sắm!</p>
          <Button variant="primary" onClick={() => navigate("/")}>
            Quay về trang chủ
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      <h2 className="mb-4">🛒 Giỏ hàng của bạn</h2>

      <Row>
        <Col lg={8}>
          <ListGroup>
            {cartItems.map((item) => (
              <ListGroup.Item key={item.id} className="mb-3">
                <Row className="align-items-center">
                  <Col md={3}>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="img-fluid rounded"
                      style={{
                        maxHeight: "150px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                  </Col>
                  <Col md={6}>
                    <h5 className="mb-2">{item.title}</h5>
                    <p className="text-success fw-bold mb-2">
                      {Number(item.price).toLocaleString()} VNĐ
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          handleUpdateQuantity(item.photo_id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="fw-bold px-3">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          handleUpdateQuantity(item.photo_id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </div>
                  </Col>
                  <Col md={3} className="text-end">
                    <p className="fw-bold text-primary mb-3">
                      {(item.price * item.quantity).toLocaleString()} VNĐ
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.photo_id)}
                    >
                      🗑️ Xóa
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Body>
              <h4 className="mb-4">📋 Tóm tắt đơn hàng</h4>

              <div className="d-flex justify-content-between mb-2">
                <span>Tổng số ảnh:</span>
                <strong>{cartItems.length}</strong>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span>Tổng số lượng:</span>
                <strong>
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </strong>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <h5 className="mb-0">Tổng tiền:</h5>
                <h5 className="text-success mb-0">
                  {calculateTotal().toLocaleString()} VNĐ
                </h5>
              </div>

              <Button
                variant="success"
                size="lg"
                className="w-100"
                onClick={handleCheckout}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang xử lý...
                  </>
                ) : (
                  "💳 Thanh toán qua VNPay"
                )}
              </Button>

              <Button
                variant="outline-secondary"
                className="w-100 mt-2"
                onClick={() => navigate("/")}
              >
                ← Tiếp tục mua sắm
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Checkout;

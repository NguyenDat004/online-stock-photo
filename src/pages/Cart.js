import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import axios from "axios";
import { auth } from "../firebase";
import { toast } from "react-toastify";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const res = await axios.get(
          `http://localhost:5000/api/cart/${user.uid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCartItems(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy giỏ hàng:", err);
      }
    };

    fetchCart();
  }, []);

  const handleSelectItem = (photoId) => {
    setSelectedItems((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  // Chọn tất cả
  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      // Nếu đã chọn hết thì bỏ chọn tất cả
      setSelectedItems([]);
    } else {
      // Chọn tất cả
      setSelectedItems(cartItems.map(item => item.photo_id));
    }
  };

  useEffect(() => {
    const selectedTotal = cartItems
      .filter((item) => selectedItems.includes(item.photo_id))
      .reduce((sum, item) => sum + item.price, 0);
    setTotal(selectedTotal);
  }, [selectedItems, cartItems]);

  const handleRemove = async (photoId) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.delete(
        `http://localhost:5000/api/cart/${user.uid}/${photoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCartItems(cartItems.filter((item) => item.photo_id !== photoId));
      setSelectedItems((prev) => prev.filter((id) => id !== photoId));
    } catch (err) {
      console.error("❌ Lỗi khi xoá ảnh khỏi giỏ:", err);
    }
  };

  // Xóa các sản phẩm đã chọn
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) {
      toast.info("⚠️ Vui lòng chọn ít nhất một sản phẩm để xóa.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      // Xóa từng item đã chọn
      await Promise.all(
        selectedItems.map(photoId =>
          axios.delete(
            `http://localhost:5000/api/cart/${user.uid}/${photoId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      toast.success(`Đã xóa ${selectedItems.length} sản phẩm khỏi giỏ hàng!`, {
        position: "top-right",
        autoClose: 2000,
      });

      setCartItems(cartItems.filter((item) => !selectedItems.includes(item.photo_id)));
      setSelectedItems([]);
      setTotal(0);
    } catch (err) {
      console.error("❌ Lỗi khi xóa sản phẩm:", err);
      toast.error("❌ Xóa sản phẩm thất bại. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.info("⚠️ Vui lòng chọn ít nhất một sản phẩm để thanh toán.", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }
  
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();
  
      console.log("🛒 Checkout with selected items:", selectedItems);
  
      // Gọi API tạo URL thanh toán VNPay - GỬI selectedPhotoIds
      const res = await axios.post(
        "http://localhost:5000/api/vnpay/create-payment",
        {
          selectedPhotoIds: selectedItems // ✅ GỬI DANH SÁCH PHOTO_ID ĐÃ CHỌN
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (res.data.paymentUrl) {
        console.log("✅ Redirecting to VNPay...");
        // Redirect sang VNPay để thanh toán thật
        window.location.href = res.data.paymentUrl;
      } else {
        toast.error("Không tạo được liên kết thanh toán VNPay.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo thanh toán VNPay:", err);
      toast.error("❌ Lỗi khi tạo thanh toán. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };
  

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f7fa",
      padding: "40px 20px"
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
  
            {/* Header */}
            <div className="mb-4">
              <h2 className="fw-bold mb-2">🛒 Giỏ Hàng Của Bạn</h2>
              <p className="text-muted">{cartItems.length} sản phẩm trong giỏ</p>
            </div>

            {cartItems.length === 0 ? (
              <div style={{
                background: "white",
                borderRadius: "12px",
                padding: "60px 40px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{
                  fontSize: "4rem",
                  marginBottom: "20px"
                }}>🛍️</div>
                <h3 className="mb-3" style={{ color: "#1a202c" }}>Giỏ hàng trống</h3>
                <p className="text-muted">Bạn chưa thêm ảnh nào vào giỏ hàng</p>
              </div>
            ) : (
              <>
                {/* Chọn tất cả */}
                <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                  <Form.Check
                    type="checkbox"
                    checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                    style={{ transform: "scale(1.2)" }}
                    label={
                      <span className="ms-2 fw-semibold">
                        Chọn tất cả ({selectedItems.length}/{cartItems.length})
                      </span>
                    }
                  />
                </div>

                {/* Cart Items */}
                <div style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0",
                  marginBottom: "24px"
                }}>
                  {cartItems.map((item, index) => (
                    <div
                      key={item.photo_id}
                      style={{
                        padding: "24px",
                        borderBottom: index < cartItems.length - 1 ? "1px solid #e2e8f0" : "none",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f7fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <div className="row align-items-center">
                        {/* Checkbox */}
                        <div className="col-auto">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedItems.includes(item.photo_id)}
                            onChange={() => handleSelectItem(item.photo_id)}
                            style={{
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                              accentColor: "#2d3748"
                            }}
                          />
                        </div>

                        {/* Image */}
                        <div className="col-auto">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e2e8f0"
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="col">
                          <h5 className="mb-2 fw-semibold" style={{ color: "#1a202c" }}>
                            {item.title}
                          </h5>
                          <div style={{
                            fontSize: "1.25rem",
                            color: "#2d3748",
                            fontWeight: "600"
                          }}>
                            {Number(item.price).toLocaleString()} VNĐ
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div className="col-auto">
                          <button
                            onClick={() => handleRemove(item.photo_id)}
                            style={{
                              background: "white",
                              border: "1px solid #e2e8f0",
                              color: "#e53e3e",
                              padding: "10px 20px",
                              borderRadius: "8px",
                              fontSize: "0.9rem",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = "#fff5f5";
                              e.target.style.borderColor = "#fc8181";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = "white";
                              e.target.style.borderColor = "#e2e8f0";
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Section */}
                <div style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0"
                }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                      <div className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                        Tổng cộng ({selectedItems.length} sản phẩm)
                      </div>
                      <h2 className="mb-0" style={{
                        color: "#1a202c",
                        fontWeight: "700",
                        fontSize: "2rem"
                      }}>
                        {Number(total).toLocaleString()} VNĐ
                      </h2>
                    </div>

                    <div className="d-flex gap-3">
                      {/* Nút Xóa các sản phẩm đã chọn */}
                      <button
                        onClick={handleRemoveSelected}
                        disabled={selectedItems.length === 0}
                        style={{
                          background: selectedItems.length === 0 ? "#cbd5e0" : "white",
                          border: selectedItems.length === 0 ? "1px solid #cbd5e0" : "1px solid #e53e3e",
                          color: selectedItems.length === 0 ? "#718096" : "#e53e3e",
                          padding: "16px 40px",
                          borderRadius: "8px",
                          fontSize: "1rem",
                          fontWeight: "600",
                          cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (selectedItems.length > 0) {
                            e.target.style.background = "#fff5f5";
                            e.target.style.borderColor = "#fc8181";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedItems.length > 0) {
                            e.target.style.background = "white";
                            e.target.style.borderColor = "#e53e3e";
                          }
                        }}
                      >
                        🗑️ Xóa Đã Chọn
                      </button>

                      {/* Nút Thanh Toán */}
                      <button
                        onClick={handleCheckout}
                        disabled={selectedItems.length === 0}
                        style={{
                          background: selectedItems.length === 0 ? "#cbd5e0" : "#2d3748",
                          border: "none",
                          color: "white",
                          padding: "16px 40px",
                          borderRadius: "8px",
                          fontSize: "1rem",
                          fontWeight: "600",
                          cursor: selectedItems.length === 0 ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (selectedItems.length > 0) {
                            e.target.style.background = "#1a202c";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedItems.length > 0) {
                            e.target.style.background = "#2d3748";
                          }
                        }}
                      >
                        💳 Thanh Toán Ngay
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
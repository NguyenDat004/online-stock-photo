// src/pages/PaymentSuccess.js
import React from "react";
import { useLocation, Link } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  // Lấy mã phản hồi từ VNPay
  const responseCode = query.get("vnp_ResponseCode");

  // Lấy tổng tiền (VNPay nhân 100, nên cần chia lại)
  const amount = query.get("vnp_Amount")
    ? Number(query.get("vnp_Amount")) / 100
    : 0;

  // Lấy mã giao dịch
  const txnRef = query.get("vnp_TxnRef");

  const isSuccess = responseCode === "00";

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        textAlign: "center",
        padding: "30px",
        borderRadius: "12px",
        background: "#fff",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      {isSuccess ? (
        <>
          <h1 style={{ color: "#28a745" }}>🎉 Thanh toán thành công!</h1>
          <p>Cảm ơn bạn đã mua ảnh trên hệ thống.</p>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "8px",
              textAlign: "left",
            }}
          >
            <p><strong>Mã giao dịch:</strong> {txnRef}</p>
            <p><strong>Số tiền:</strong> {amount.toLocaleString()} VND</p>
            <p><strong>Trạng thái:</strong> Thành công ✔</p>
          </div>

          <Link
            to="/download"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "12px 20px",
              background: "#007bff",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Tải ảnh đã mua
          </Link>
        </>
      ) : (
        <>
          <h1 style={{ color: "#dc3545" }}>❌ Thanh toán thất bại!</h1>
          <p>Đã có lỗi xảy ra trong quá trình thanh toán.</p>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              background: "#f8d7da",
              borderRadius: "8px",
              textAlign: "left",
            }}
          >
            <p><strong>Mã phản hồi:</strong> {responseCode || "Không có"}</p>
            <p><strong>Mã giao dịch:</strong> {txnRef || "Không có"}</p>
          </div>

          <Link
            to="/cart"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "12px 20px",
              background: "#6c757d",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Quay lại giỏ hàng
          </Link>
        </>
      )}
    </div>
  );
};

export default PaymentSuccess;

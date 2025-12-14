import React from "react";
import { useLocation, Link } from "react-router-dom";

const PaymentSuccess = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const responseCode = query.get("vnp_ResponseCode");
  const amount = query.get("vnp_Amount") ? Number(query.get("vnp_Amount")) / 100 : 0;
  const txnRef = query.get("vnp_TxnRef");
  const transactionId = query.get("transaction_id");

  const isSuccess = responseCode === "00";

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#0a0e27",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: "20px" 
    }}>
      <div style={{ 
        maxWidth: "650px", 
        width: "100%", 
        background: "#151a30",
        borderRadius: "24px", 
        boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.05)"
      }}>
        {isSuccess ? (
          <>
            {/* Success Header */}
            <div style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "50px 40px 40px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Decorative circles */}
              <div style={{
                position: "absolute",
                top: "-80px",
                right: "-80px",
                width: "200px",
                height: "200px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%"
              }}></div>
              <div style={{
                position: "absolute",
                bottom: "-60px",
                left: "-60px",
                width: "150px",
                height: "150px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%"
              }}></div>

              {/* Success Icon */}
              <div style={{
                width: "120px",
                height: "120px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 25px",
                border: "3px solid rgba(255,255,255,0.3)",
                position: "relative",
                zIndex: 1
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="white" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 style={{ 
                fontSize: "32px", 
                fontWeight: "800", 
                margin: "0 0 12px",
                color: "white",
                position: "relative",
                zIndex: 1,
                letterSpacing: "-0.5px"
              }}>
                Thanh toán thành công!
              </h1>
              <p style={{ 
                fontSize: "16px", 
                opacity: 0.95,
                margin: 0,
                color: "white",
                position: "relative",
                zIndex: 1
              }}>
                Cảm ơn bạn đã mua ảnh trên hệ thống
              </p>
            </div>

            {/* Success Body */}
            <div style={{ padding: "40px" }}>
              {/* Transaction Details */}
              <div style={{
                background: "rgba(108, 92, 231, 0.05)",
                border: "1px solid rgba(108, 92, 231, 0.15)",
                borderRadius: "16px",
                padding: "25px",
                marginBottom: "25px"
              }}>
                <h3 style={{ 
                  color: "#74b9ff", 
                  fontSize: "14px", 
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "20px"
                }}>
                  Chi tiết giao dịch
                </h3>

                <div style={{ marginBottom: "18px" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ color: "#b2bec3", fontSize: "14px" }}>Mã giao dịch</span>
                    <span style={{ 
                      color: "white", 
                      fontSize: "15px",
                      fontWeight: "600",
                      fontFamily: "monospace",
                      background: "rgba(255,255,255,0.05)",
                      padding: "6px 12px",
                      borderRadius: "8px"
                    }}>
                      #{txnRef}
                    </span>
                  </div>
                </div>

                {transactionId && (
                  <div style={{ marginBottom: "18px" }}>
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span style={{ color: "#b2bec3", fontSize: "14px" }}>ID đơn hàng</span>
                      <span style={{ 
                        color: "white", 
                        fontSize: "15px",
                        fontWeight: "600",
                        fontFamily: "monospace",
                        background: "rgba(255,255,255,0.05)",
                        padding: "6px 12px",
                        borderRadius: "8px"
                      }}>
                        #{transactionId}
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: "18px" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ color: "#b2bec3", fontSize: "14px" }}>Số tiền</span>
                    <span style={{ 
                      color: "#55efc4",
                      fontSize: "24px",
                      fontWeight: "700"
                    }}>
                      {amount.toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>

                <div style={{ 
                  paddingTop: "18px",
                  borderTop: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span style={{ color: "#b2bec3", fontSize: "14px" }}>Trạng thái</span>
                    <span style={{
                      background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                      color: "white",
                      padding: "8px 20px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "700",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round"
                        />
                      </svg>
                      Thành công
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link
                  to="/orders"
                  style={{
                    display: "block",
                    padding: "16px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: "700",
                    fontSize: "16px",
                    textAlign: "center",
                    transition: "all 0.3s",
                    border: "none",
                    boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 28px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  📦 Xem đơn hàng & Tải ảnh
                </Link>

                <Link
                  to="/"
                  style={{
                    display: "block",
                    padding: "16px",
                    background: "rgba(255,255,255,0.05)",
                    color: "#dfe6e9",
                    borderRadius: "12px",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "16px",
                    textAlign: "center",
                    transition: "all 0.3s",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.08)";
                    e.target.style.borderColor = "rgba(255,255,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255,255,255,0.05)";
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  🏠 Về trang chủ
                </Link>
              </div>

              {/* Info Note */}
              <div style={{
                marginTop: "25px",
                padding: "16px",
                background: "rgba(116, 185, 255, 0.05)",
                border: "1px solid rgba(116, 185, 255, 0.15)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginTop: "2px", flexShrink: 0 }}>
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                    stroke="#74b9ff" 
                    strokeWidth="2" 
                    strokeLinecap="round"
                  />
                </svg>
                <p style={{ 
                  color: "#74b9ff", 
                  fontSize: "13px", 
                  margin: 0,
                  lineHeight: "1.6"
                }}>
                  Ảnh của bạn đã sẵn sàng để tải xuống. Truy cập trang đơn hàng để xem chi tiết và tải về ảnh chất lượng cao.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Failed Header */}
            <div style={{ 
              background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
              padding: "50px 40px 40px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute",
                top: "-80px",
                right: "-80px",
                width: "200px",
                height: "200px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%"
              }}></div>

              <div style={{
                width: "120px",
                height: "120px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 25px",
                border: "3px solid rgba(255,255,255,0.3)",
                position: "relative",
                zIndex: 1
              }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                  <path d="M6 18L18 6M6 6L18 18" 
                    stroke="white" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h1 style={{ 
                fontSize: "32px", 
                fontWeight: "800", 
                margin: "0 0 12px",
                color: "white",
                position: "relative",
                zIndex: 1
              }}>
                Thanh toán thất bại
              </h1>
              <p style={{ 
                fontSize: "16px", 
                opacity: 0.95,
                margin: 0,
                color: "white",
                position: "relative",
                zIndex: 1
              }}>
                Đã có lỗi xảy ra trong quá trình thanh toán
              </p>
            </div>

            {/* Failed Body */}
            <div style={{ padding: "40px" }}>
              <div style={{
                background: "rgba(235, 51, 73, 0.05)",
                border: "1px solid rgba(235, 51, 73, 0.2)",
                borderRadius: "16px",
                padding: "25px",
                marginBottom: "25px"
              }}>
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#b2bec3", fontSize: "14px" }}>Mã phản hồi</span>
                    <span style={{ color: "#ff7675", fontWeight: "600", fontFamily: "monospace" }}>
                      {responseCode || "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#b2bec3", fontSize: "14px" }}>Mã giao dịch</span>
                    <span style={{ color: "#ff7675", fontWeight: "600", fontFamily: "monospace" }}>
                      {txnRef || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Link to="/cart" style={{
                  display: "block",
                  padding: "16px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "16px",
                  textAlign: "center",
                  transition: "all 0.3s"
                }}>
                  🛒 Quay lại giỏ hàng
                </Link>

                <Link to="/" style={{
                  display: "block",
                  padding: "16px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#dfe6e9",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.1)"
                }}>
                  🏠 Về trang chủ
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
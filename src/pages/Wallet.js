import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Wallet() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const formatMoney = (num) => {
    return Number(num).toLocaleString("vi-VN") + " VNĐ";
  };

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return navigate("/login");

        const token = await user.getIdToken();
        const res = await axios.get(
          "https://online-stock-photo.onrender.com/api/wallet/balance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBalance(res.data.balance || 0);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error("Wallet fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0e27",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner-border"
            style={{ width: "3rem", height: "3rem", color: "#6c5ce7" }}
          ></div>
          <p style={{ marginTop: "20px", color: "#a29bfe", fontSize: "16px" }}>
            Đang tải ví của bạn...
          </p>
        </div>
      </div>
    );
  }

  // Tính tổng thu nhập và chi tiêu
  const totalIncome = transactions
    .filter((t) => t.type === "earn")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalWithdraw = transactions
    .filter((t) => t.type === "withdraw")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e27",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <h1
            style={{
              color: "white",
              fontSize: "36px",
              fontWeight: "700",
              marginBottom: "10px",
            }}
          >
            Ví của tôi
          </h1>
          <p style={{ color: "#74b9ff", fontSize: "16px", margin: 0 }}>
            Quản lý tài chính và theo dõi giao dịch
          </p>
        </div>

        {/* Stats Cards Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Main Balance Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "20px",
              padding: "30px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(102, 126, 234, 0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
              }}
            ></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>💰</div>
              <p
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "14px",
                  marginBottom: "10px",
                  fontWeight: "500",
                }}
              >
                SỐ DƯ KHẢ DỤNG
              </p>
              <h2
                style={{
                  color: "white",
                  fontSize: "32px",
                  fontWeight: "700",
                  margin: "0 0 20px",
                }}
              >
                {formatMoney(balance)}
              </h2>
              <button
                onClick={() => navigate("/withdraw-request")}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "12px 30px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "white";
                  e.target.style.color = "#667eea";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                  e.target.style.color = "white";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                💸 Rút tiền ngay
              </button>
            </div>
          </div>

          {/* Total Income Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              borderRadius: "20px",
              padding: "30px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(17, 153, 142, 0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
              }}
            ></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>📈</div>
              <p
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "14px",
                  marginBottom: "10px",
                  fontWeight: "500",
                }}
              >
                TỔNG THU NHẬP
              </p>
              <h2
                style={{
                  color: "white",
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                {formatMoney(totalIncome)}
              </h2>
            </div>
          </div>

          {/* Total Withdraw Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              borderRadius: "20px",
              padding: "30px",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 40px rgba(250, 112, 154, 0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
              }}
            ></div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>📤</div>
              <p
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "14px",
                  marginBottom: "10px",
                  fontWeight: "500",
                }}
              >
                ĐÃ RÚT
              </p>
              <h2
                style={{
                  color: "white",
                  fontSize: "28px",
                  fontWeight: "700",
                  margin: 0,
                }}
              >
                {formatMoney(totalWithdraw)}
              </h2>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div
          style={{
            background: "#151a30",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              📜 Lịch sử giao dịch
            </h3>
            <span
              style={{
                background: "rgba(108, 92, 231, 0.2)",
                color: "#a29bfe",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {transactions.length} giao dịch
            </span>
          </div>

          {transactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "rgba(108, 92, 231, 0.05)",
                borderRadius: "15px",
                border: "2px dashed rgba(108, 92, 231, 0.2)",
              }}
            >
              <div
                style={{
                  fontSize: "5rem",
                  marginBottom: "20px",
                  filter: "grayscale(1)",
                  opacity: 0.5,
                }}
              >
                📭
              </div>
              <h5
                style={{
                  color: "#a29bfe",
                  fontSize: "18px",
                  marginBottom: "10px",
                }}
              >
                Chưa có giao dịch nào
              </h5>
              <p style={{ color: "#636e72", fontSize: "14px" }}>
                Lịch sử giao dịch của bạn sẽ hiển thị tại đây
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 10px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        color: "#74b9ff",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "15px",
                        textAlign: "left",
                        letterSpacing: "1px",
                      }}
                    >
                      Ngày
                    </th>
                    <th
                      style={{
                        color: "#74b9ff",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "15px",
                        textAlign: "left",
                        letterSpacing: "1px",
                      }}
                    >
                      Loại
                    </th>
                    <th
                      style={{
                        color: "#74b9ff",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "15px",
                        textAlign: "left",
                        letterSpacing: "1px",
                      }}
                    >
                      Mô tả
                    </th>
                    <th
                      style={{
                        color: "#74b9ff",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "15px",
                        textAlign: "right",
                        letterSpacing: "1px",
                      }}
                    >
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr
                      key={tx.id}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        transition: "all 0.3s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(108, 92, 231, 0.1)";
                        e.currentTarget.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.02)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      <td
                        style={{
                          padding: "20px 15px",
                          color: "#b2bec3",
                          fontSize: "14px",
                          borderTopLeftRadius: "10px",
                          borderBottomLeftRadius: "10px",
                        }}
                      >
                        {new Date(tx.created_at).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td style={{ padding: "20px 15px" }}>
                        {tx.type === "earn" && (
                          <span
                            style={{
                              background:
                                "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                              color: "white",
                              padding: "8px 16px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span>💰</span> Thu nhập
                          </span>
                        )}
                        {tx.type === "withdraw" && (
                          <span
                            style={{
                              background:
                                "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                              color: "white",
                              padding: "8px 16px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span>💸</span> Rút tiền
                          </span>
                        )}
                        {tx.type === "refund" && (
                          <span
                            style={{
                              background:
                                "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
                              color: "#2d3436",
                              padding: "8px 16px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <span>↩️</span> Hoàn tiền
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "20px 15px",
                          color: "#dfe6e9",
                          fontSize: "14px",
                        }}
                      >
                        {tx.description}
                      </td>
                      <td
                        style={{
                          padding: "20px 15px",
                          textAlign: "right",
                          fontWeight: "700",
                          fontSize: "16px",
                          color: tx.type === "withdraw" ? "#ff7675" : "#55efc4",
                          borderTopRightRadius: "10px",
                          borderBottomRightRadius: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                            }}
                          >
                            {tx.type === "withdraw" ? "-" : "+"}
                          </span>
                          <span>{formatMoney(tx.amount)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Wallet;

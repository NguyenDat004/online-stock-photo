import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function WithdrawRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return navigate("/login");

        const token = await user.getIdToken();

        const res = await axios.get(
          "https://online-stock-photo.onrender.com/api/wallet/balance",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBalance(Number(res.data.balance));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bankName || !bankAccount) {
      return toast.error("Vui lòng nhập đầy đủ thông tin ngân hàng!");
    }

    if (amount < 50000) {
      return toast.error("Số tiền tối thiểu để rút là 50.000 VNĐ!");
    }

    if (amount > balance) {
      return toast.error("Số dư không đủ!");
    }

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.post(
        "https://online-stock-photo.onrender.com/api/withdraw/request",
        {
          amount: Number(amount),
          bank_name: bankName,
          bank_account: bankAccount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Gửi yêu cầu rút tiền thành công!");
      navigate("/wallet");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi gửi yêu cầu rút!");
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-4">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <Card className="shadow p-4">
        <h3 className="mb-3 text-center">💵 Yêu cầu rút tiền</h3>

        <p>
          <strong>Số dư hiện tại:</strong>{" "}
          {Number(balance).toLocaleString("vi-VN")} VNĐ
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tên ngân hàng</Form.Label>
            <Form.Control
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ví dụ: MB Bank, Vietcombank..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Số tài khoản</Form.Label>
            <Form.Control
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Nhập số tài khoản"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Số tiền muốn rút</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số tiền (VNĐ)"
              required
            />
          </Form.Group>

          <Button type="submit" className="w-100" variant="primary">
            Gửi yêu cầu
          </Button>
        </Form>
      </Card>
    </Container>
  );
}

export default WithdrawRequest;

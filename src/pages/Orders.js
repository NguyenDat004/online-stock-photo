import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import { Container, Table, Spinner, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.warning('⚠️ Vui lòng đăng nhập!');
        navigate('/login');
        return;
      }

      const token = await user.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/transactions/history/${user.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching orders:', error.message);
      toast.error('❌ Lỗi khi lấy danh sách đơn hàng!');
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Container>
      <h2>Danh sách đơn hàng</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Tổng giá</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Số lượng ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.transaction_id}>
                <td>{order.transaction_id}</td>
                <td>{order.total_price.toLocaleString()} VND</td>
                <td>{order.status}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>{order.total_items}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/order-detail/${order.transaction_id}`)}
                  >
                    Xem chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default Orders;
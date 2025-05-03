import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Lấy giỏ hàng từ backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        const res = await axios.get(`http://localhost:5000/api/cart/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCartItems(res.data);
        const total = res.data.reduce((sum, item) => sum + item.price, 0);
        setTotal(total);
      } catch (err) {
        console.error('❌ Lỗi khi lấy giỏ hàng:', err);
      }
    };

    fetchCart();
  }, []);

  const handleRemove = async (photoId) => {
    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      await axios.delete(`http://localhost:5000/api/cart/${user.uid}/${photoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(cartItems.filter(item => item.photo_id !== photoId));
      setTotal(prev => prev - cartItems.find(item => item.photo_id === photoId).price);
    } catch (err) {
      console.error('❌ Lỗi khi xoá ảnh khỏi giỏ:', err);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">🛒 Giỏ hàng của bạn</h2>
      {cartItems.length === 0 ? (
        <p>Bạn chưa thêm ảnh nào vào giỏ.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Giá</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => (
                <tr key={item.photo_id}>
                  <td>
                    <img src={item.image_url} alt={item.title} width="100" className="rounded" />
                  </td>
                  <td>{item.title}</td>
                  <td>{Number(item.price).toLocaleString()} VNĐ</td>
                  <td className="text-center">
                    <button className="btn btn-danger btn-sm" onClick={() => handleRemove(item.photo_id)}>
                    🗑️Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4 className="text-end">Tổng cộng: {Number(total).toLocaleString()} VNĐ</h4>
          <div className="text-end">
            <a href="/checkout" className="btn btn-success mt-3">Thanh toán</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;

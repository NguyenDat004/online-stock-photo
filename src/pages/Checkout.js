import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) return;

        try {
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
      });

      return () => unsubscribe();
    };

    fetchCart();
  }, []);

  const handleChange = (e) => {
    setFormData({ 
      ...formData,
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      await axios.post(
        'http://localhost:5000/api/checkout',
        {
          userId: user.uid,
          items: cartItems,
          totalPrice: total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmitted(true);
      setCartItems([]);
      setTotal(0);

      // Chuyển sang trang Download sau khi thanh toán
      setTimeout(() => {
        navigate('/download');
      }, 1000);
    } catch (err) {
      console.error('❌ Lỗi khi thanh toán:', err);
      alert('Thanh toán thất bại');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Thông tin thanh toán</h2>

      {submitted ? (
        <div className="alert alert-success">
          <h4 className="alert-heading">🎉 Cảm ơn bạn!</h4>
          <p>Đơn hàng của bạn đã được xử lý thành công. Đang chuyển hướng...</p>
        </div>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <p>Bạn chưa có ảnh nào trong giỏ hàng.</p>
          ) : (
            <>
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.photo_id}>
                      <td>
                        <img src={item.image_url} alt={item.title} width="100" className="rounded" />
                      </td>
                      <td>{item.title}</td>
                      <td>{Number(item.price).toLocaleString()} VNĐ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h4 className="text-end">Tổng cộng: {Number(total).toLocaleString()} VNĐ</h4>

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Họ và tên</label>
                      <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Địa chỉ</label>
                      <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Số thẻ</label>
                      <input type="text" className="form-control" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required maxLength={16} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ngày hết hạn</label>
                      <input type="text" className="form-control" placeholder="MM/YY" name="expiry" value={formData.expiry} onChange={handleChange} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">CVC</label>
                      <input type="text" className="form-control" name="cvc" value={formData.cvc} onChange={handleChange} required maxLength={3} />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-success mt-3">Xác nhận thanh toán</button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Checkout;

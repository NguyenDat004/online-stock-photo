const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/checkout – Tạo giao dịch và transaction_items
router.post('/', async (req, res) => {
  const { userId, items, totalPrice } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Tính tổng số ảnh
    const totalItems = items.length;

    // Thêm vào bảng transactions
    const result = await client.query(
      `INSERT INTO transactions (user_id, total_price, total_items) 
       VALUES ($1, $2, $3) RETURNING transaction_id`,
      [userId, totalPrice, totalItems]
    );

    const transactionId = result.rows[0].transaction_id;

    // Thêm từng ảnh vào bảng transaction_items
    for (const item of items) {
      await client.query(
        `INSERT INTO transaction_items (transaction_id, photo_id, price)
         VALUES ($1, $2, $3)`,
        [transactionId, item.photo_id, item.price]
      );
    }

    // Xóa giỏ hàng sau khi thanh toán
    await client.query('DELETE FROM carts WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
    res.json({ message: 'Thanh toán thành công' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi thanh toán:', err);
    res.status(500).json({ message: 'Lỗi khi xử lý thanh toán' });
  } finally {
    client.release();
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

//  Thêm ảnh vào giỏ hàng
router.post('/add', async (req, res) => {
  const { userId, photoId, quantity = 1 } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM carts WHERE user_id = $1 AND photo_id = $2',
      [userId, photoId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE carts SET quantity = quantity + $1 WHERE user_id = $2 AND photo_id = $3',
        [quantity, userId, photoId]
      );
    } else {
      await pool.query(
        'INSERT INTO carts (user_id, photo_id, quantity) VALUES ($1, $2, $3)',
        [userId, photoId, quantity]
      );
    }

    res.status(200).json({ message: '✔️ Đã thêm vào giỏ hàng' });
  } catch (err) {
    console.error('❌ Lỗi khi thêm vào giỏ hàng:', err);
    res.status(500).json({ message: 'Lỗi server khi thêm vào giỏ hàng' });
  }
});

//  Lấy giỏ hàng của người dùng
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.id, p.id AS photo_id, p.title, p.image_url, p.price, c.quantity
       FROM carts c
       JOIN photos p ON c.photo_id = p.id
       WHERE c.user_id = $1`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Lỗi khi lấy giỏ hàng:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy giỏ hàng' });
  }
});

//  Xoá một ảnh khỏi giỏ
router.delete('/:userId/:photoId', async (req, res) => {
  const { userId, photoId } = req.params;

  try {
    await pool.query(
      'DELETE FROM carts WHERE user_id = $1 AND photo_id = $2',
      [userId, photoId]
    );
    res.status(200).json({ message: '🗑️ Đã xoá ảnh khỏi giỏ hàng' });
  } catch (err) {
    console.error('❌ Lỗi khi xoá ảnh khỏi giỏ hàng:', err);
    res.status(500).json({ message: 'Lỗi server khi xoá ảnh' });
  }
});

module.exports = router;

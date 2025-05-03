const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/photos/admin – Lấy tất cả ảnh cho admin kèm tên danh mục
router.get('/admin', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        photos.id,
        photos.title,
        photos.uploader,
        photos.status,
        photos.category_id,
        categories.category_name AS category_name,
        photos.created_at
      FROM photos
      LEFT JOIN categories ON photos.category_id = categories.category_id
      ORDER BY photos.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách ảnh cho admin:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách ảnh cho admin' });
  }
});




// GET /api/photos – Lấy ảnh "Đã duyệt" cho trang chủ
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        photos.*, 
        categories.category_name AS category 
      FROM photos
      LEFT JOIN categories ON photos.category_id = categories.category_id
      WHERE photos.status = 'Đã duyệt'
      ORDER BY photos.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách ảnh:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách ảnh' });
  }
});



// GET /api/photos/:id – Lấy ảnh theo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        photos.*, 
        categories.category_name AS category 
      FROM photos
      LEFT JOIN categories ON photos.category_id = categories.category_id
      WHERE photos.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi lấy ảnh:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy ảnh' });
  }
});

// POST /api/photos/upload – Upload ảnh mới (mặc định "Chưa duyệt")
router.post('/upload', async (req, res) => {
  try {
    const { title, description, price, category_id, imageUrl, uploader } = req.body;

    const userRes = await pool.query('SELECT full_name FROM users WHERE uid = $1', [uploader]);
    const fullName = userRes.rows[0]?.full_name || 'Ẩn danh';

    const result = await pool.query(
      `INSERT INTO photos (title, description, price, category_id, image_url, uploader, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, price, category_id, imageUrl, fullName, 'Chưa duyệt']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Lỗi khi lưu metadata ảnh:', err);
    res.status(500).json({ message: 'Lỗi server khi lưu ảnh' });
  }
});

// PUT /api/photos/:id/approve – Duyệt ảnh (chuyển status => "Đã duyệt")
router.put('/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE photos SET status = 'Đã duyệt' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh để duyệt' });
    }
    res.json({ message: '✅ Ảnh đã được duyệt', photo: result.rows[0] });
  } catch (err) {
    console.error('Lỗi khi duyệt ảnh:', err);
    res.status(500).json({ message: 'Lỗi server khi duyệt ảnh' });
  }
});

// PUT /api/photos/:id – Cập nhật ảnh 
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category_id } = req.body;

  try {
    const result = await pool.query(
      'UPDATE photos SET title = $1, category_id = $2 WHERE id = $3 RETURNING *',
      [title, category_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh để cập nhật' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi cập nhật ảnh:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật ảnh' });
  }
});

// DELETE /api/photos/:id – Xóa ảnh
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM photos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy ảnh để xóa' });
    }
    res.json({ message: 'Ảnh đã được xóa', photo: result.rows[0] });
  } catch (err) {
    console.error('Lỗi khi xóa ảnh:', err);
    res.status(500).json({ message: 'Lỗi server khi xóa ảnh' });
  }
});

module.exports = router;

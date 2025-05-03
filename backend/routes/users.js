const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const admin = require('../config/firebase-admin'); // dùng SDK của Firebase Admin

// GET /api/users – Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng' });
  }
});

// DELETE /api/users/:id – Xóa người dùng cả Firebase Auth và PostgreSQL
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Firebase UID
  
    const client = await pool.connect();
  
    try {
      // 1. Cố gắng xóa trên Firebase Auth
      try {
        await admin.auth().deleteUser(id);
      } catch (firebaseError) {
        if (firebaseError.code === 'auth/user-not-found') {
          console.warn(`Người dùng UID ${id} không tồn tại trên Firebase, tiếp tục xóa ở DB`);
        } else {
          throw firebaseError;
        }
      }
  
      // 2. Transaction để xóa cart trước rồi user
      await client.query('BEGIN');
  
      // Xóa carts của user
      await client.query('DELETE FROM carts WHERE user_id = $1', [id]);
  
      // Sau đó xóa user
      const result = await client.query('DELETE FROM users WHERE uid = $1', [id]);
  
      await client.query('COMMIT');
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Người dùng không tồn tại trong cơ sở dữ liệu' });
      }
  
      res.json({ message: 'Xóa người dùng thành công' });
  
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Lỗi khi xóa người dùng:', err);
      res.status(500).json({ message: 'Lỗi server khi xóa người dùng' });
    } finally {
      client.release();
    }
});

// GET /api/users/:email – Lấy thông tin người dùng theo email
// routes/users.js
router.get('/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      const result = await pool.query(
        'SELECT uid, full_name, email, role FROM users WHERE email = $1',
        [email]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error('❌ Lỗi khi lấy user theo email:', err);
      res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  });
  

module.exports = router;

const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const pool = require('../config/db');

// Login
router.post('/login', async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    const userCheck = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);
    if (userCheck.rows.length === 0) {
      await pool.query('INSERT INTO users (uid, email) VALUES ($1, $2)', [uid, email]);
    }

    return res.json({
      message: 'Đăng nhập thành công',
      user: { uid, email },
    });
  } catch (err) {
    console.error('Lỗi xác thực:', err);
    res.status(401).json({ message: 'Xác thực thất bại' });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { token, fullName, email } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    const userCheck = await pool.query('SELECT * FROM users WHERE uid = $1', [uid]);
    if (userCheck.rows.length > 0) {
      return res.status(200).json({ message: 'Người dùng đã tồn tại' });
    }

    await pool.query(
      'INSERT INTO users (uid, full_name, email) VALUES ($1, $2, $3)',
      [uid, fullName, email]
    );

    return res.status(201).json({ message: 'Đăng ký thành công', user: { uid, fullName, email } });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi đăng ký người dùng' });
  }
});

module.exports = router;

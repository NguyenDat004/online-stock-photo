const admin = require('../config/firebase');
const pool = require('../config/db'); // Kết nối DB

const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Không tìm thấy token!' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Lấy thông tin người dùng từ DB (ví dụ vai trò)
    const { rows } = await pool.query(
      'SELECT id, email, full_name, role FROM users WHERE email = $1',
      [decodedToken.email]
    );

    if (rows.length > 0) {
      req.user.dbUser = rows[0]; // Lưu vào req.user.dbUser để dùng sau
    }

    next();
  } catch (error) {
    console.error('❌ Lỗi xác thực Firebase:', error);
    return res.status(401).json({ message: 'Token không hợp lệ!' });
  }
};

module.exports = verifyFirebaseToken;

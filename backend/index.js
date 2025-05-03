// Nạp biến môi trường từ file .env (ví dụ PORT, DB config, v.v.)
require('dotenv').config();

// Import các thư viện cần thiết
const express = require('express');      // Framework xây dựng server
const cors = require('cors');            // Hỗ trợ truy cập từ frontend (CORS)
const app = express();                   // Khởi tạo ứng dụng Express

// Kết nối PostgreSQL (file này chứa pool để thao tác DB)
const pool = require('./config/db');

// Kết nối Firebase Admin SDK (dùng để xác thực người dùng)
const admin = require('./config/firebase');

// Các middleware xử lý chung
app.use(cors());                         // Cho phép frontend gọi API
app.use(express.json());                 // Tự động parse JSON từ body request

// Định nghĩa route xác thực người dùng
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// -------------------------
// Định nghĩa route lấy ảnh
// -------------------------
const photoRoutes = require('./routes/photos');
app.use('/api/photos', photoRoutes);  // Route lấy ảnh từ DB

// Định nghĩa route giỏ hàng
const cartRouter = require('./routes/cart');
app.use('/api/cart', cartRouter);

// Định nghĩa route người dùng
const userRoutes = require('./routes/users'); // Route lấy thông tin người dùng
const categoryRoutes = require('./routes/categories'); // Route lấy danh sách ảnh theo danh mục

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Định nghĩa route thanh toán
const checkoutRoutes = require('./routes/checkout'); // Route thanh toán
app.use('/api/checkout', checkoutRoutes);

// Định nghĩa route tải ảnh về
// Route này sẽ trả về danh sách ảnh đã tải về của người dùng
const downloadRoutes = require('./routes/downloads');
app.use('/api/downloads', downloadRoutes);

// Định nghĩa route đánh giá ảnh
const reviewRoutes = require('./routes/reviews');
app.use('/api/reviews', reviewRoutes);

// Route test backend đang hoạt động
app.get('/', (req, res) => {
  res.send('🔥 Backend đang hoạt động!');
});

// Khởi chạy server ở cổng PORT (mặc định 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
});

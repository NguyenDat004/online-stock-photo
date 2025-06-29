// backend/routes/photos.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Multer setup
const upload = multer({ dest: "uploads/" });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// GET /admin – tất cả ảnh kèm tên danh mục
router.get("/admin", async (req, res) => {
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
    console.error("Lỗi khi lấy danh sách ảnh cho admin:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách ảnh cho admin" });
  }
});

// GET / – ảnh "Đã duyệt"
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT photos.*, categories.category_name AS category
      FROM photos
      LEFT JOIN categories ON photos.category_id = categories.category_id
      WHERE photos.status = 'Đã duyệt'
      ORDER BY photos.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách ảnh:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách ảnh" });
  }
});

// GET /:id – lấy ảnh theo id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT photos.*, categories.category_name AS category
      FROM photos
      LEFT JOIN categories ON photos.category_id = categories.category_id
      WHERE photos.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy ảnh" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi lấy ảnh:", err);
    res.status(500).json({ message: "Lỗi server khi lấy ảnh" });
  }
});

// POST /upload – xử lý resize, watermark, upload
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Không có ảnh được upload" });
    }

    const imagePath = req.file.path;
    const original = await Jimp.read(imagePath);

    // Resize nếu cần
    if (original.getWidth() > 1280) {
      original.resize(1280, Jimp.AUTO);
    }

    original.quality(70);

    // Kiểm tra watermark có tồn tại không
    const watermarkPath = path.join(__dirname, "../assets/watermark.png");

    if (fs.existsSync(watermarkPath)) {
      try {
        const watermark = await Jimp.read(watermarkPath);
        watermark.resize(original.getWidth() / 4, Jimp.AUTO);

        const x = original.getWidth() - watermark.getWidth() - 10;
        const y = original.getHeight() - watermark.getHeight() - 10;

        original.composite(watermark, x, y, {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacitySource: 0.6,
        });

        console.log("✅ Đã thêm watermark thành công");
      } catch (watermarkError) {
        console.warn("⚠️ Lỗi khi thêm watermark:", watermarkError.message);
        console.log("📤 Tiếp tục upload không có watermark");
      }
    } else {
      console.warn("⚠️ Không tìm thấy file watermark.png tại:", watermarkPath);
      console.log("📤 Tiếp tục upload không có watermark");
    }

    const processedBuffer = await original.getBufferAsync(Jimp.MIME_JPEG);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "photo_stock" },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
      stream.end(processedBuffer);
    });

    fs.unlinkSync(imagePath); // xóa file gốc

    res.status(200).json({ message: "Upload thành công", data: result });
  } catch (err) {
    console.error("❌ Lỗi khi xử lý ảnh upload:", err);

    // Xóa file tạm nếu có lỗi
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: err.message || "Lỗi khi upload ảnh" });
  }
});
// PUT /:id/approve – duyệt ảnh
router.put("/:id/approve", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE photos SET status = 'Đã duyệt' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy ảnh để duyệt" });
    res.json({ message: "✅ Ảnh đã được duyệt", photo: result.rows[0] });
  } catch (err) {
    console.error("Lỗi khi duyệt ảnh:", err);
    res.status(500).json({ message: "Lỗi server khi duyệt ảnh" });
  }
});

// PUT /:id – cập nhật title/category
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, category_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE photos SET title = $1, category_id = $2 WHERE id = $3 RETURNING *`,
      [title, category_id, id]
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ message: "Không tìm thấy ảnh để cập nhật" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Lỗi khi cập nhật ảnh:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật ảnh" });
  }
});

// DELETE /:id – xóa ảnh
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM photos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Không tìm thấy ảnh để xóa" });
    res.json({ message: "Ảnh đã được xóa", photo: result.rows[0] });
  } catch (err) {
    console.error("Lỗi khi xóa ảnh:", err);
    res.status(500).json({ message: "Lỗi server khi xóa ảnh" });
  }
});

module.exports = router;

const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccountKey.json');

// Tránh lỗi khi khởi tạo lại app nhiều lần
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;

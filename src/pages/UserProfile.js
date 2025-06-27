import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/users/${encodeURIComponent(
              currentUser.email
            )}`
          );
          setUserData(res.data);
          console.log("📥 Thông tin người dùng:", res.data);
        } catch (err) {
          console.error("❌ Không lấy được thông tin người dùng:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return <div className="text-center mt-5">Đang tải thông tin...</div>;

  if (!userData)
    return (
      <div className="text-center mt-5 text-danger">
        Không tìm thấy người dùng.
      </div>
    );

  return (
    <div className="container mt-5">
      <h2>👤 Thông tin cá nhân</h2>
      <div className="card shadow p-4 mt-3">
        <p>
          <strong>Họ tên:</strong> {userData.full_name || "Chưa cập nhật"}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Vai trò:</strong> {userData.role}
        </p>
        <p>
          <strong>Ngày tạo:</strong>{" "}
          {new Date(userData.created_at).toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}

export default UserProfile;

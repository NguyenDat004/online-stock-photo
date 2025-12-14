import React, { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const res = await axios.get(
            `https://online-stock-photo.onrender.com/api/users/${encodeURIComponent(
              currentUser.email
            )}`
          );

          setUserData(res.data);

          setFormData({
            full_name: res.data.full_name || "",
            avatar_url: res.data.avatar_url || "",
          });
        } catch (err) {
          console.error("❌ Lỗi tải thông tin người dùng:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await axios.put(
        `https://online-stock-photo.onrender.com/api/users/${userData.uid}/avatar`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setFormData({ ...formData, avatar_url: res.data.avatar });
    } catch (err) {
      toast.error("❌ Lỗi tải ảnh đại diện. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 2000,
      });
      console.error(err);
    }

    setUploading(false);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `https://online-stock-photo.onrender.com/api/users/${userData.uid}`,
        formData
      );

      setUserData({ ...userData, ...formData });
      setEditMode(false);
      toast.success("✅ Cập nhật thông tin thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi cập nhật thông tin. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return <div className="text-center mt-5">Đang tải thông tin...</div>;

  if (!userData)
    return (
      <div className="text-center mt-5 text-danger">
        Không tìm thấy người dùng.
      </div>
    );

  return (
    <div className="container mt-5" style={{ maxWidth: "650px" }}>
      <div className="text-center mb-4">
        <img
          src={
            formData.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="avatar"
          className="avatar"
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />

        {editMode && (
          <div className="mt-3">
            <label className="btn btn-outline-primary">
              Chọn ảnh mới
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </label>

            {uploading && <div className="text-muted">Đang upload...</div>}
          </div>
        )}

        <h2 className="mt-3 fw-bold">Thông tin cá nhân</h2>
      </div>

      <div className="card shadow-lg p-4">
        {editMode ? (
          <>
            <div className="mb-3">
              <label className="form-label fw-semibold">Họ tên</label>
              <input
                type="text"
                className="form-control form-control-lg"
                name="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                value={userData.email}
                disabled
                style={{ background: "#e9ecef" }}
              />
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                className="btn btn-primary px-4 me-2"
                onClick={handleSave}
              >
                💾 Lưu
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => setEditMode(false)}
              >
                Hủy
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="fs-5">
              <strong>Họ tên: </strong> {userData.full_name || "Chưa cập nhật"}
            </p>

            <p className="fs-5">
              <strong>Email:</strong> {userData.email}
            </p>

            <p className="fs-5">
              <strong>Vai trò:</strong>{" "}
              <span className="badge bg-primary">{userData.role}</span>
            </p>

            <p className="fs-6 text-muted">
              <strong>Ngày tạo:</strong> {formatDate(userData.created_at)}
            </p>

            <div className="text-center">
              <button
                className="btn btn-warning  px-4"
                onClick={() => setEditMode(true)}
              >
                ✏ Chỉnh sửa
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfile;

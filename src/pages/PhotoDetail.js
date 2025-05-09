import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./PhotoDetail.css";
import { auth } from "../firebase";
import { ToastContainer, toast } from "react-toastify";

function PhotoDetail() {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // 👈 Dùng để lấy tên và role từ DB

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/photos/${id}`);
        setPhoto(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu ảnh:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReviews(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy review:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/users/${currentUser.email}`
          );
          setUserData(res.data);
        } catch (err) {
          console.error(
            "❌ Không lấy được thông tin người dùng từ server:",
            err
          );
        }
      } else {
        setUserData(null);
      }
    });

    fetchPhoto();
    fetchReviews();

    return () => unsubscribe();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const userId = auth.currentUser.uid;

      await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          userId,
          photoId: photo.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("🛒 Ảnh đã được thêm vào giỏ hàng!", {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (err) {
      console.error("Lỗi khi thêm ảnh vào giỏ:", err);
      console.error("Lỗi khi thêm ảnh vào giỏ:", err);
      toast.error("Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.", {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Bạn cần đăng nhập để gửi đánh giá.");
      return;
    }

    if (newReview.rating < 1 || newReview.rating > 5) {
      alert("Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();

      const res = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          photo_id: id,
          user_id: user.uid,
          rating: newReview.rating,
          comment: newReview.comment,
          user_name: userData?.full_name || user.displayName || user.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews([res.data, ...reviews]);
      setNewReview({ rating: 0, comment: "" });
    } catch (err) {
      console.error("❌ Lỗi khi thêm review:", err);
      alert("Không thể gửi đánh giá. Vui lòng thử lại.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const token = await auth.currentUser.getIdToken();

      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
    } catch (err) {
      console.error("❌ Lỗi khi xoá review:", err);
      alert("Không thể xoá review. Vui lòng thử lại.");
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loading) return <div className="text-center mt-5">Đang tải ảnh...</div>;

  if (!photo)
    return (
      <div className="text-center text-danger mt-5">Không tìm thấy ảnh.</div>
    );

  return (
    <div className="container py-5 photo-detail-container">
      <div className="row">
        <div className="col-md-6">
          <img
            src={photo.image_url}
            alt={photo.title}
            className="img-fluid rounded photo-detail-image"
            onClick={openModal}
            style={{ cursor: "zoom-in" }}
          />
        </div>
        <div className="col-md-6 photo-detail-info">
          <h2 className="photo-detail-title">{photo.title}</h2>
          <p>
            <strong>Danh mục:</strong> {photo.category || "Không có danh mục"}
          </p>
          <p>
            <strong>Giấy phép:</strong> {photo.license_type || "Chưa rõ"}
          </p>
          <p>
            <strong>Người đăng:</strong> {photo.uploader || "Ẩn danh"}
          </p>
          <p>
            <strong>Ngày đăng:</strong>{" "}
            {new Date(photo.created_at).toLocaleDateString()}
          </p>
          <p className="photo-detail-price">
            <strong>Giá:</strong> {Number(photo.price).toLocaleString()} VNĐ
          </p>
          <p>{photo.description}</p>
          <button
            className="btn btn-success mt-4 photo-detail-btn px-4 py-2 fw-bold"
            onClick={handleAddToCart}
          >
            🛒 Thêm vào giỏ hàng
          </button>
        </div>
      </div>
      <div className="mt-5">
        <h3>Đánh giá & Nhận xét</h3>
        <form onSubmit={handleAddReview} className="mb-4">
          <div className="mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setNewReview({ ...newReview, rating: star })}
                style={{
                  fontSize: "24px",
                  color: star <= newReview.rating ? "gold" : "gray",
                  cursor: "pointer",
                }}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="form-control mb-2"
            rows="3"
            placeholder="Nhận xét của bạn..."
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
          />
          <button type="submit" className="btn btn-primary">
            Gửi đánh giá
          </button>
        </form>

        {reviews.length === 0 ? (
          <p>Chưa có đánh giá nào.</p>
        ) : (
          <ul className="list-group">
            {reviews.map((review) => (
              <li key={review.review_id} className="list-group-item">
                <div>
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} style={{ color: "gold" }}>
                      ★
                    </span>
                  ))}
                  {[...Array(5 - review.rating)].map((_, i) => (
                    <span key={i} style={{ color: "gray" }}>
                      ★
                    </span>
                  ))}
                </div>
                <p>{review.comment}</p>
                <small className="text-muted">
                  Đăng bởi {review.user_name || "Ẩn Danh"} vào{" "}
                  {new Date(review.created_at).toLocaleString()}
                </small>
                {(user?.uid === review.user_id ||
                  userData?.role === "admin") && (
                  <button
                    className="btn btn-sm btn-danger ms-2"
                    onClick={() => handleDeleteReview(review.review_id)}
                  >
                    Xoá
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {isModalOpen && (
        <div className="photo-modal" onClick={closeModal}>
          <img
            src={photo.image_url}
            alt={photo.title}
            className="photo-modal-image"
          />
          <span className="photo-modal-close" onClick={closeModal}>
            &times;
          </span>
        </div>
      )}
      <ToastContainer />;
    </div>
  );
}

export default PhotoDetail;

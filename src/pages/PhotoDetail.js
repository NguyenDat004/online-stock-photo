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
  const [userData, setUserData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  
  // ✅ THÊM: State kiểm tra trạng thái ảnh
  const [photoStatus, setPhotoStatus] = useState({
    isPurchased: false,
    isInCart: false,
    canAddToCart: true,
    loading: true
  });

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
          
          // ✅ THÊM: Kiểm tra trạng thái ảnh khi user đăng nhập
          checkPhotoStatus(currentUser);
        } catch (err) {
          console.error(
            "❌ Không lấy được thông tin người dùng từ server:",
            err
          );
        }
      } else {
        setUserData(null);
        setPhotoStatus({
          isPurchased: false,
          isInCart: false,
          canAddToCart: true,
          loading: false
        });
      }
    });

    fetchPhoto();
    fetchReviews();

    return () => unsubscribe();
  }, [id]);

  // ✅ THÊM: Function kiểm tra trạng thái ảnh
  const checkPhotoStatus = async (currentUser = user) => {
    try {
      if (!currentUser) {
        setPhotoStatus({
          isPurchased: false,
          isInCart: false,
          canAddToCart: true,
          loading: false
        });
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `http://localhost:5000/api/photos/check-status/${id}/${currentUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`✅ Photo ${id} status:`, response.data);
      setPhotoStatus({
        ...response.data,
        loading: false
      });
    } catch (err) {
      console.error("❌ Lỗi khi kiểm tra trạng thái ảnh:", err);
      setPhotoStatus({
        isPurchased: false,
        isInCart: false,
        canAddToCart: true,
        loading: false
      });
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!user) {
        toast.warning("⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!", {
          position: "top-right",
          autoClose: 2000,
        });
        return;
      }

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
        position: "top-right",
        autoClose: 2000,
      });

      // ✅ THÊM: Cập nhật trạng thái sau khi thêm thành công
      setPhotoStatus(prev => ({
        ...prev,
        isInCart: true,
        canAddToCart: false
      }));

    } catch (err) {
      console.error("Lỗi khi thêm ảnh vào giỏ:", err);
      
      if (err.response?.status === 400) {
        const errorMsg = err.response?.data?.message || "";

        if (errorMsg.includes("đã mua")) {
          toast.info("ℹ️ Bạn đã sở hữu ảnh này rồi!", {
            position: "top-right",
            autoClose: 2000,
          });
          setPhotoStatus(prev => ({
            ...prev,
            isPurchased: true,
            canAddToCart: false
          }));
        } else if (errorMsg.includes("đã có trong giỏ hàng")) {
          toast.warning("⚠️ Ảnh này đã có trong giỏ hàng!", {
            position: "top-right",
            autoClose: 2000,
          });
          setPhotoStatus(prev => ({
            ...prev,
            isInCart: true,
            canAddToCart: false
          }));
        } else {
          toast.error("❌ Không thể thêm vào giỏ hàng!", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      } else {
        toast.error("Lỗi khi thêm vào giỏ hàng. Vui lòng thử lại.", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.info("⚠️ Vui lòng đăng nhập để gửi đánh giá!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    if (newReview.rating < 1 || newReview.rating > 5) {
      toast.warning("⚠️ Vui lòng chọn đánh giá từ 1 đến 5 sao.", {
        position: "top-right",
        autoClose: 2000,
      });
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
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 2000,
      });
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
      toast.error("Không thể xoá đánh giá. Vui lòng thử lại.", {
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
          <div className={`photo-detail-image-wrapper ${imageLoading ? 'loading' : ''}`}>
            <img
              src={photo.image_url}
              alt={photo.title}
              className="photo-detail-image"
              onClick={openModal}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          </div>
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
            {formatDate(photo.created_at)}
          </p>
          <p className="photo-detail-price">
            <strong>Giá:</strong> {Number(photo.price).toLocaleString()} VNĐ
          </p>
          <p>{photo.description}</p>
          
          {/* ✅ THAY ĐỔI: Hiển thị nút dựa trên trạng thái */}
          {photoStatus.loading ? (
            <button
              className="btn btn-secondary mt-4 photo-detail-btn px-4 py-2 fw-bold"
              disabled
            >
              Đang kiểm tra...
            </button>
          ) : photoStatus.isPurchased ? (
            <button
              className="btn btn-success mt-4 photo-detail-btn px-4 py-2 fw-bold"
              disabled
            >
              ✓ Đã sở hữu
            </button>
          ) : photoStatus.isInCart ? (
            <button
              className="btn btn-secondary mt-4 photo-detail-btn px-4 py-2 fw-bold"
              disabled
            >
              ✓ Đã có trong giỏ hàng
            </button>
          ) : (
            <button
              className="btn btn-success mt-4 photo-detail-btn px-4 py-2 fw-bold"
              onClick={handleAddToCart}
            >
              🛒 Thêm vào giỏ hàng
            </button>
          )}
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
            {reviews.map((review) => {
              // Kiểm tra quyền xóa - chỉ cho phép nếu là chủ review hoặc admin
              const isOwner = user && user.uid === review.user_id;
              const isAdmin = userData && userData.role === "admin";
              const canDelete = isOwner || isAdmin;
              
              return (
                <li key={review.review_id} className="list-group-item">
                  {canDelete && (
                    <button
                      className="review-delete-btn"
                      onClick={() => handleDeleteReview(review.review_id)}
                    >
                      Xoá
                    </button>
                  )}
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
                    {formatDate(review.created_at)}
                  </small>
                </li>
              );
            })}
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
      <ToastContainer />
    </div>
  );
}

export default PhotoDetail;
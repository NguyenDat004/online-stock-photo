import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import "./PhotoCard.css";

function PhotoCard({ photo }) {
  const navigate = useNavigate();
  const [photoStatus, setPhotoStatus] = useState({
    isPurchased: false,
    isInCart: false,
    canAddToCart: true,
    loading: true
  });

  // Kiểm tra trạng thái ảnh khi component mount
  useEffect(() => {
    checkPhotoStatus();
  }, [photo.id]);

  // ✅ THÊM: Lắng nghe event thanh toán thành công
  useEffect(() => {
    const handlePurchaseCompleted = () => {
      console.log("🔔 Purchase completed event received, rechecking status...");
      checkPhotoStatus();
    };

    // Đăng ký lắng nghe event
    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
    };
  }, [photo.id]);

  // ✅ THÊM: Lắng nghe event thanh toán thành công
  useEffect(() => {
    const handlePurchaseCompleted = () => {
      console.log("🔔 Purchase completed event received, rechecking status...");
      checkPhotoStatus();
    };

    // Đăng ký lắng nghe event
    window.addEventListener('purchaseCompleted', handlePurchaseCompleted);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('purchaseCompleted', handlePurchaseCompleted);
    };
  }, [photo.id]);

  const checkPhotoStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setPhotoStatus({
          isPurchased: false,
          isInCart: false,
          canAddToCart: true,
          loading: false
        });
        return;
      }

      const token = await user.getIdToken();
      
      const response = await axios.get(
        `http://localhost:5000/api/photos/check-status/${photo.id}/${user.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`✅ Photo ${photo.id} status:`, response.data);

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

  const handleDetail = () => {
    navigate(`/photo/${photo.id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.warning("⚠️ Vui lòng đăng nhập để thêm vào giỏ hàng!", {
          position: "top-right",
          autoClose: 2000,
        });
        navigate("/login");
        return;
      }

      const token = await user.getIdToken();

      await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          userId: user.uid,
          photoId: photo.id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("🛒 Đã thêm vào giỏ hàng!", {
        position: "top-right",
        autoClose: 2000,
      });

      // Cập nhật trạng thái ngay lập tức
      setPhotoStatus(prev => ({
        ...prev,
        isInCart: true,
        canAddToCart: false
      }));

    } catch (err) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);

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
        toast.error("❌ Không thể thêm vào giỏ hàng. Vui lòng thử lại!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    }
  };

  // Xác định button text và style
  const getButtonConfig = () => {
    if (photoStatus.loading) {
      return {
        text: <Spinner animation="border" size="sm" />,
        disabled: true,
        variant: "secondary"
      };
    }
    
    if (photoStatus.isPurchased) {
      return {
        text: "✓ Đã sở hữu",
        disabled: true,
        variant: "success"
      };
    }
    
    if (photoStatus.isInCart) {
      return {
        text: "✓ Trong giỏ",
        disabled: true,
        variant: "secondary"
      };
    }
    
    return {
      text: "🛒 Thêm",
      disabled: false,
      variant: "primary"
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <Card className="mb-4 shadow-sm photo-card border-0 rounded-4 overflow-hidden h-100">
      <div className="photo-card-img-wrapper">
        <Card.Img
          loading="lazy"
          variant="top"
          src={photo.image_url}
          alt={photo.title}
          className="photo-card-img"
        />
        {photoStatus.isPurchased && (
          <Badge 
            bg="success" 
            className="position-absolute top-0 end-0 m-2"
            style={{ fontSize: '0.75rem' }}
          >
            ✓ Đã mua
          </Badge>
        )}
      </div>
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <Card.Title className="fw-bold text-truncate">
            {photo.title}
          </Card.Title>
          <Card.Text className="text-muted mb-1">
            👤 Người đăng: <strong>{photo.uploader || "Ẩn danh"}</strong>
          </Card.Text>
          <Card.Text className="text-success fs-5 mb-2">
            {Number(photo.price).toLocaleString()} VNĐ
          </Card.Text>
          {photo.category && (
            <Badge bg="secondary" className="mb-2">
              {photo.category}
            </Badge>
          )}
        </div>

        {/* Buttons Container */}
        <div className="d-flex gap-2 mt-3">
          <Button
            variant="outline-primary"
            onClick={handleDetail}
            className="flex-grow-1"
          >
            Xem chi tiết
          </Button>
          <Button
            variant={buttonConfig.variant}
            onClick={handleAddToCart}
            disabled={buttonConfig.disabled}
            className="d-flex align-items-center gap-1"
            style={{ 
              whiteSpace: "nowrap",
              opacity: buttonConfig.disabled ? 0.6 : 1,
              cursor: buttonConfig.disabled ? "not-allowed" : "pointer"
            }}
          >
            {buttonConfig.text}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default PhotoCard;
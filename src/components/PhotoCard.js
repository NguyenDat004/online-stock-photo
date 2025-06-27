import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./PhotoCard.css"; // Import custom styles for PhotoCard

function PhotoCard({ photo }) {
  const navigate = useNavigate();

  const handleDetail = () => {
    navigate(`/photo/${photo.id}`);
  };

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
        <Button
          variant="outline-primary"
          onClick={handleDetail}
          className="w-100 mt-3"
        >
          Xem chi tiết
        </Button>
      </Card.Body>
    </Card>
  );
}

export default PhotoCard;

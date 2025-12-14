import { useEffect, useState } from "react";
import PhotoCard from "../components/PhotoCard";
import axios from "axios";

function Home() {
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [categories, setCategories] = useState(["Tất cả"]); // Lấy từ database
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sortOrder, setSortOrder] = useState("none");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Hàm fetch photos (tách riêng để có thể gọi lại)
  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/photos");
      setPhotos(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải ảnh:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm fetch categories từ database
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(["Tất cả", ...res.data.map(cat => cat.name)]);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh mục:", err);
    }
  };

  // Lấy dữ liệu ảnh từ backend
  useEffect(() => {
    fetchPhotos();
    fetchCategories(); // Lấy danh mục từ database
  }, []);

  // Lọc, tìm kiếm, sắp xếp
  useEffect(() => {
    let filtered = photos;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (photo) =>
          photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "Tất cả") {
      filtered = filtered.filter(
        (photo) => photo.category === selectedCategory
      );
    }

    if (sortOrder === "asc") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    setFilteredPhotos(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortOrder, photos]);

  // Tính toán phân trang
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPhotos = filteredPhotos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);

  return (
    <div className="container mt-5">
      {/* Banner */}
      <div className="banner mb-5 position-relative">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80"
          alt="Banner"
          className="img-fluid rounded shadow"
          style={{ width: "100%", height: "300px", objectFit: "cover" }}
        />
        <div
          className="position-absolute top-50 start-50 translate-middle text-white text-center"
          style={{ textShadow: "0 0 10px rgba(0,0,0,0.7)" }}
        >
          <h1>🖼️ Chào mừng đến với Stock Gallery</h1>
          <p className="lead">
            Khám phá & mua những bức ảnh đẹp nhất từ cộng đồng sáng tạo
          </p>
        </div>
      </div>

      {/* Header với nút Tải lại */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📸 Kho Ảnh Mới Nhất</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => {
            fetchPhotos();
            fetchCategories(); // Cập nhật cả danh mục
          }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang tải...
            </>
          ) : (
            <>🔄 Tải lại</>
          )}
        </button>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="row mb-4">
        <div className="col-md-4 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Tìm kiếm ảnh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="none">Sắp xếp theo giá</option>
            <option value="asc">💲 Giá tăng dần</option>
            <option value="desc">💰 Giá giảm dần</option>
          </select>
        </div>
      </div>

      {/* Danh sách ảnh */}
      <div className="row">
        {currentPhotos.map((photo) => (
          <div className="col-md-4 mb-4" key={photo.id}>
            <PhotoCard photo={photo} />
          </div>
        ))}
        {filteredPhotos.length === 0 && (
          <p className="text-center">Chưa có ảnh nào phù hợp.</p>
        )}
      </div>

      {/* Phân trang - THÊM NÚT TRƯỚC/SAU */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              {/* Nút Trước */}
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="page-link"
                  disabled={currentPage === 1}
                >
                  ‹ Trước
                </button>
              </li>

              {/* Các số trang */}
              {[...Array(totalPages)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    onClick={() => setCurrentPage(i + 1)}
                    className="page-link"
                  >
                    {i + 1}
                  </button>
                </li>
              ))}

              {/* Nút Sau */}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="page-link"
                  disabled={currentPage === totalPages}
                >
                  Sau ›
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export default Home;
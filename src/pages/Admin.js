import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Table, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

function Admin() {
  const [photos, setPhotos] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [photoRes, userRes, categoryRes] = await Promise.all([
          axios.get('http://localhost:5000/api/photos/admin'),
          axios.get('http://localhost:5000/api/users'),
          axios.get('http://localhost:5000/api/categories'),
        ]);
        setPhotos(photoRes.data);
        setUsers(userRes.data);
        setCategories(categoryRes.data);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/photos/${id}/approve`);
      setPhotos(photos.map(photo => photo.id === id ? { ...photo, status: 'Đã duyệt' } : photo));
    } catch (err) {
      console.error('Lỗi khi duyệt ảnh:', err);
    }
  };

  const handleDeletePhoto = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/photos/${id}`);
      setPhotos(photos.filter(photo => photo.id !== id));
    } catch (err) {
      console.error('Lỗi khi xóa ảnh:', err);
    }
  };

  const handleSavePhotoEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/photos/${selectedPhoto.id}`, {
        title: selectedPhoto.title,
        category_id: parseInt(selectedPhoto.category_id),
      });

      setPhotos(photos.map(photo => 
        photo.id === selectedPhoto.id
          ? { ...photo, title: selectedPhoto.title, category_name: getCategoryNameById(selectedPhoto.category_id) }
          : photo
      ));

      setShowPhotoModal(false);
    } catch (err) {
      console.error('Lỗi khi lưu chỉnh sửa ảnh:', err);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        await axios.post('http://localhost:5000/api/categories', { name: newCategory });
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
        setNewCategory('');
      } catch (err) {
        console.error('Lỗi khi thêm danh mục:', err);
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`);
        const res = await axios.get('http://localhost:5000/api/categories');
        setCategories(res.data);
        setPhotos(prev =>
          prev.map(p =>
            p.category_id === id ? { ...p, category_id: null, category_name: '' } : p
          )
        );
      } catch (err) {
        console.error('Lỗi khi xóa danh mục:', err);
      }
    }
  };

  const handleDeleteUser = async (uid) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này không?")) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${uid}`);
        setUsers(users.filter(user => user.uid !== uid));
      } catch (err) {
        console.error("Lỗi khi xóa người dùng:", err);
      }
    }
  };

  const getCategoryNameById = (id) => {
    const category = categories.find(cat => cat.id === parseInt(id));
    return category ? category.name : '';
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Trang Quản trị</h2>
      <Tabs defaultActiveKey="photos" className="mb-3">
        <Tab eventKey="photos" title="Quản lý ảnh">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tiêu đề</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {photos.map((photo, index) => (
                <tr key={photo.id}>
                  <td>{index + 1}</td>
                  <td>{photo.title}</td>
                  <td>{photo.uploader}</td>
                  <td>{photo.category_name || 'Không có danh mục'}</td>
                  <td>{photo.status}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => handleApprove(photo.id)}
                      disabled={photo.status === 'Đã duyệt'}
                    >
                      Duyệt
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelectedPhoto({
                          id: photo.id,
                          title: photo.title,
                          category_id: photo.category_id
                        });
                        setShowPhotoModal(true);
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePhoto(photo.id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="users" title="Quản lý người dùng">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên</th>
                <th>Email</th>
                <th className="text-center">Role</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.uid}>
                  <td>{index + 1}</td>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td className="text-center">{user.role}</td>
                  <td className="text-center">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(user.uid)}
                    >
                      🗑️ Xoá
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="categories" title="Quản lý danh mục">
          <Form className="d-flex mb-3">
            <Form.Control
              type="text"
              placeholder="Thêm danh mục mới"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="me-2"
            />
            <Button onClick={handleAddCategory}>Thêm</Button>
          </Form>
          <ul className="list-group">
            {categories.map((cat) => (
              <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                {cat.name}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  Xóa
                </Button>
              </li>
            ))}
          </ul>
        </Tab>
      </Tabs>

      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa thông tin ảnh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                value={selectedPhoto?.title || ''}
                onChange={(e) => setSelectedPhoto({ ...selectedPhoto, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                value={selectedPhoto?.category_id || ''}
                onChange={(e) => setSelectedPhoto({ ...selectedPhoto, category_id: e.target.value })}
              >
                <option value="">Không có</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSavePhotoEdit}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Admin;

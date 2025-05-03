// src/components/AdminRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await axios.get(`http://localhost:5000/api/users/${user.email}`);
          setIsAdmin(res.data.role === 'admin');
        } catch (err) {
          console.error('Lỗi khi kiểm tra role:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center mt-5">🔐 Đang kiểm tra quyền truy cập...</div>;

  return isAdmin ? children : <Navigate to="/" />;
}

export default AdminRoute;

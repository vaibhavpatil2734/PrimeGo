import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../../services/auth.service';

const AdminRouteGuard = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }

    const role = getUserRole();
    if (role !== 'Admin') {
      navigate('/profile', { replace: true });
      return;
    }

    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return children;
};

export default AdminRouteGuard;


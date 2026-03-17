import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../services/auth.service';

const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('[FRONTEND AUTH GUARD] No token - redirect to login');
      navigate('/login', { replace: true });
      return;
    }
    const role = getUserRole() || 'unknown';
    console.log(`[FRONTEND ADMIN GUARD] Role: ${role}, Can access admin: ${role === 'admin'}`);
    if (role !== 'admin') {
      console.log('[FRONTEND ADMIN GUARD] Non-admin access denied - redirect home');
      navigate('/', { replace: true });
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

export default AuthGuard;

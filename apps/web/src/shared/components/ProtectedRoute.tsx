import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin }) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-600">
        Đang tải...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

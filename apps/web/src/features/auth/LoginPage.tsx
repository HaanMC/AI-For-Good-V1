import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'AI Học Văn 10 — Login';
  }, []);

  const handleLogin = async () => {
    await signInWithGoogle();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">Đăng nhập</h1>
        <p className="mt-2 text-sm text-stone-600">
          Sử dụng tài khoản Google để truy cập vào nền tảng AI Học Văn 10.
        </p>
        <button
          onClick={handleLogin}
          className="mt-6 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800"
        >
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

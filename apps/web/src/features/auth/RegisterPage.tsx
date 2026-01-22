import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'AI Học Văn 10 — Register';
  }, []);

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        username,
        password,
        displayName: displayName.trim() || undefined,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">Tạo tài khoản</h1>
        <p className="mt-2 text-sm text-stone-600">
          Đăng ký tài khoản học sinh để lưu hồ sơ điểm và điểm yếu.
        </p>
        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700">Tên đăng nhập</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
              placeholder="username"
              autoComplete="username"
              required
            />
            <p className="mt-1 text-xs text-stone-400">Chỉ dùng chữ thường, số, dấu gạch dưới (3-20 ký tự).</p>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Tên hiển thị (tuỳ chọn)</label>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">Mật khẩu</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Đang tạo...' : 'Đăng ký'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-stone-900 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

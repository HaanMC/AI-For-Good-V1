import React, { useState } from 'react';
import { apiGet, apiPost } from '../../../shared/services/apiClient';

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await apiGet<{ data: Array<Record<string, unknown>> }>(`/api/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRole = async (uid?: string, role?: 'admin' | 'student') => {
    if (!uid || !role) return;
    await apiPost('/api/admin/setRole', { uid, role });
    handleSearch();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">Users</h2>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo email hoặc tên"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <button
          onClick={handleSearch}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
        >
          Tìm kiếm
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-stone-500">Đang tải...</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={String(user.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 p-4">
              <div>
                <p className="text-sm font-medium text-stone-900">{String(user.displayName || 'Không tên')}</p>
                <p className="text-xs text-stone-500">{String(user.email || 'Không email')}</p>
                <p className="text-xs text-stone-400">Role: {String(user.role || 'student')}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSetRole(String(user.id), 'admin')}
                  className="rounded-full border border-stone-200 px-3 py-1 text-xs"
                >
                  Set Admin
                </button>
                <button
                  onClick={() => handleSetRole(String(user.id), 'student')}
                  className="rounded-full border border-stone-200 px-3 py-1 text-xs"
                >
                  Set Student
                </button>
              </div>
            </div>
          ))}
          {!users.length && <p className="text-sm text-stone-500">Chưa có kết quả.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

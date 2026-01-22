import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../../../shared/services/apiClient';

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (value?: { seconds?: number; _seconds?: number }) => {
    if (!value) return '—';
    if (typeof value.seconds === 'number') return new Date(value.seconds * 1000).toLocaleDateString();
    if (typeof value._seconds === 'number') return new Date(value._seconds * 1000).toLocaleDateString();
    return '—';
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await apiGet<{ data: Array<Record<string, unknown>> }>(`/api/admin/users?search=${encodeURIComponent(search)}`);
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">Users</h2>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo username hoặc tên"
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
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-stone-500">
              <tr>
                <th className="px-2 py-2">Username</th>
                <th className="px-2 py-2">Display name</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Created</th>
                <th className="px-2 py-2">Last login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={String(user.id)} className="border-t border-stone-100">
                  <td className="px-2 py-2">
                    <Link
                      to={`/adminpanel/users/${String(user.id)}`}
                      state={{ breadcrumbLabel: user.displayName || user.username || user.id }}
                      className="font-medium text-stone-900 hover:underline"
                    >
                      {String(user.username || user.id)}
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-stone-600">{String(user.displayName || '—')}</td>
                  <td className="px-2 py-2 text-stone-600">{String(user.role || 'student')}</td>
                  <td className="px-2 py-2 text-xs text-stone-500">{formatDate(user.createdAt as { seconds?: number; _seconds?: number })}</td>
                  <td className="px-2 py-2 text-xs text-stone-500">{formatDate(user.lastLoginAt as { seconds?: number; _seconds?: number })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <p className="mt-3 text-sm text-stone-500">Chưa có kết quả.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

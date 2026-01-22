import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../shared/services/apiClient';

const AdminClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<Array<Record<string, unknown>>>([]);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('10');
  const [joinCodes, setJoinCodes] = useState<Record<string, string>>({});

  const loadClasses = async () => {
    const response = await apiGet<{ data: Array<Record<string, unknown>> }>('/api/admin/classes');
    setClasses(response.data);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreate = async () => {
    if (!name) return;
    await apiPost('/api/admin/classes', { name, grade });
    setName('');
    loadClasses();
  };

  const handleGenerateCode = async (classId: string) => {
    const response = await apiPost<{ code: string }>(`/api/admin/classes/${classId}/join-code`, {});
    setJoinCodes((prev) => ({ ...prev, [classId]: response.code }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">Classes</h2>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tên lớp"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <input
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
          className="w-20 rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <button
          onClick={handleCreate}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
        >
          Tạo lớp
        </button>
      </div>
      <div className="space-y-2">
        {classes.map((item) => (
          <div key={String(item.id)} className="rounded-2xl border border-stone-200 p-3">
            <p className="text-sm font-medium text-stone-900">{String(item.name)}</p>
            <p className="text-xs text-stone-500">Khối: {String(item.grade || '—')}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => handleGenerateCode(String(item.id))}
                className="rounded-full border border-stone-200 px-3 py-1"
              >
                Tạo mã tham gia
              </button>
              {joinCodes[String(item.id)] && (
                <span className="rounded-full bg-stone-900 px-3 py-1 text-white">
                  {joinCodes[String(item.id)]}
                </span>
              )}
            </div>
          </div>
        ))}
        {!classes.length && <p className="text-sm text-stone-500">Chưa có lớp nào.</p>}
      </div>
    </div>
  );
};

export default AdminClassesPage;

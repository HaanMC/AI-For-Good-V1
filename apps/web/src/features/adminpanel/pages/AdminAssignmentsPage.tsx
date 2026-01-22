import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../shared/services/apiClient';

const AdminAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Array<Record<string, unknown>>>([]);
  const [classId, setClassId] = useState('');
  const [type, setType] = useState('exam');

  const loadAssignments = async () => {
    const response = await apiGet<{ data: Array<Record<string, unknown>> }>('/api/admin/assignments');
    setAssignments(response.data);
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreate = async () => {
    if (!classId) return;
    await apiPost('/api/admin/assignments', { classId, type });
    setClassId('');
    loadAssignments();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">Assignments</h2>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={classId}
          onChange={(event) => setClassId(event.target.value)}
          placeholder="Class ID"
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-xl border border-stone-200 px-3 py-2 text-sm"
        >
          <option value="exam">Exam</option>
          <option value="writing">Writing</option>
        </select>
        <button
          onClick={handleCreate}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white"
        >
          Tạo bài tập
        </button>
      </div>
      <div className="space-y-2">
        {assignments.map((item) => (
          <div key={String(item.id)} className="rounded-2xl border border-stone-200 p-3">
            <p className="text-sm font-medium text-stone-900">{String(item.type)}</p>
            <p className="text-xs text-stone-500">Class: {String(item.classId || '—')}</p>
          </div>
        ))}
        {!assignments.length && <p className="text-sm text-stone-500">Chưa có bài tập.</p>}
      </div>
    </div>
  );
};

export default AdminAssignmentsPage;

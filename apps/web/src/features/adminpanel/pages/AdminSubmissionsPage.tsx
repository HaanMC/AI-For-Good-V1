import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../shared/services/apiClient';

const AdminSubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const load = async () => {
      const response = await apiGet<{ data: Array<Record<string, unknown>> }>('/api/admin/submissions');
      setSubmissions(response.data);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">Submissions</h2>
      <div className="space-y-2">
        {submissions.map((item) => (
          <div key={String(item.id)} className="rounded-2xl border border-stone-200 p-3">
            <p className="text-sm font-medium text-stone-900">Assignment {String(item.assignmentId || '—')}</p>
            <p className="text-xs text-stone-500">UID: {String(item.uid || '—')}</p>
          </div>
        ))}
        {!submissions.length && <p className="text-sm text-stone-500">Chưa có bài nộp.</p>}
      </div>
    </div>
  );
};

export default AdminSubmissionsPage;

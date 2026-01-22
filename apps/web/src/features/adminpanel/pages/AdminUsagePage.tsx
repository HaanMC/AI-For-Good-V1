import React, { useEffect, useState } from 'react';
import { apiGet } from '../../../shared/services/apiClient';

type UsageLog = {
  id: string;
  uid: string;
  feature: string;
  status: string;
  latencyMs: number;
  createdAt?: { seconds: number };
  requestId?: string;
};

const AdminUsagePage: React.FC = () => {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiGet<{ data: UsageLog[] }>('/api/admin/usage');
        setLogs(response.data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-stone-900">Usage</h2>
      <p className="mt-2 text-sm text-stone-600">Theo dõi 100 lượt sử dụng gần nhất.</p>
      {loading ? (
        <p className="mt-4 text-sm text-stone-500">Đang tải...</p>
      ) : (
        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-stone-500">
              <tr>
                <th className="px-2 py-2">UID</th>
                <th className="px-2 py-2">Feature</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Latency</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-stone-100">
                  <td className="px-2 py-2 text-xs text-stone-600">{log.uid}</td>
                  <td className="px-2 py-2">{log.feature}</td>
                  <td className="px-2 py-2">{log.status}</td>
                  <td className="px-2 py-2">{log.latencyMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsagePage;

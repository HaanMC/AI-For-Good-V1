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

type UsageSummary = {
  total: number;
  byFeature: Record<string, number>;
  byStatus: Record<string, number>;
};

const AdminUsagePage: React.FC = () => {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiGet<{ logs: UsageLog[]; summary: UsageSummary }>('/api/admin/usage');
        setLogs(response.logs);
        setSummary(response.summary);
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
      {summary && (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">Total</p>
            <p className="text-lg font-semibold text-stone-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">By feature</p>
            <div className="mt-2 space-y-1 text-sm text-stone-600">
              {Object.entries(summary.byFeature).map(([feature, count]) => (
                <div key={feature} className="flex items-center justify-between">
                  <span>{feature}</span>
                  <span className="font-medium text-stone-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-stone-200 p-4">
            <p className="text-xs text-stone-500">By status</p>
            <div className="mt-2 space-y-1 text-sm text-stone-600">
              {Object.entries(summary.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span>{status}</span>
                  <span className="font-medium text-stone-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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

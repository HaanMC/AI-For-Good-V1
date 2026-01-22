import React, { useState } from 'react';

const AdminSystemPage: React.FC = () => {
  const [quota, setQuota] = useState('500');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">System</h2>
      <p className="text-sm text-stone-600">Cấu hình quota và hệ thống backend.</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-stone-600">Daily quota</label>
        <input
          value={quota}
          onChange={(event) => setQuota(event.target.value)}
          className="w-24 rounded-xl border border-stone-200 px-3 py-2 text-sm"
        />
        <span className="text-xs text-stone-400">requests / day</span>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
        Cập nhật quota ở biến môi trường DAILY_QUOTA trên Cloud Run.
      </div>
    </div>
  );
};

export default AdminSystemPage;

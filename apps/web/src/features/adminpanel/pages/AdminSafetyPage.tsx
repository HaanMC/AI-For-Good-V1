import React from 'react';

const AdminSafetyPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">Safety</h2>
      <p className="text-sm text-stone-600">
        Theo dõi các cờ an toàn, cảnh báo nội dung, và hành vi bất thường.
      </p>
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
        Chưa có dữ liệu an toàn.
      </div>
    </div>
  );
};

export default AdminSafetyPage;

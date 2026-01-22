import React from 'react';

const AdminOverviewPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-stone-900">Tổng quan</h2>
      <p className="text-sm text-stone-600">
        Theo dõi hoạt động học tập, các lớp học và tín hiệu an toàn trong hệ thống.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs uppercase text-stone-500">Yêu cầu hôm nay</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">—</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs uppercase text-stone-500">Lớp học đang hoạt động</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">—</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;

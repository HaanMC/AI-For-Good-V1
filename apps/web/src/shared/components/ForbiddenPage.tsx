import React from 'react';
import { Link } from 'react-router-dom';

const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-900">403</h1>
        <p className="mt-2 text-sm text-stone-600">
          Bạn không có quyền truy cập trang này.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
        >
          Quay về trang chính
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;

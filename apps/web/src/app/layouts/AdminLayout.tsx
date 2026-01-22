import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Breadcrumbs from '../../shared/components/Breadcrumbs';

const adminTabs = [
  { label: 'Overview', to: '/adminpanel/overview' },
  { label: 'Usage', to: '/adminpanel/usage' },
  { label: 'Users', to: '/adminpanel/users' },
  { label: 'Classes', to: '/adminpanel/classes' },
  { label: 'Assignments', to: '/adminpanel/assignments' },
  { label: 'Submissions', to: '/adminpanel/submissions' },
  { label: 'Safety', to: '/adminpanel/safety' },
  { label: 'System', to: '/adminpanel/system' },
];

const AdminLayout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = 'AI Học Văn 10 — Admin Panel';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold text-stone-900">Admin Panel</h1>
        <div className="mt-2">
          <Breadcrumbs />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {adminTabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

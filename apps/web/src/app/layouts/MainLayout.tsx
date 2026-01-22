import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import TopNav from '../../shared/components/TopNav';
import Breadcrumbs from '../../shared/components/Breadcrumbs';
import { useAuth } from '../../shared/contexts/AuthContext';

const titleMap: Record<string, string> = {
  '/': 'AI Học Văn 10 — Dashboard',
  '/chat': 'AI Học Văn 10 — Chat',
  '/roleplay': 'AI Học Văn 10 — Roleplay',
  '/exam': 'AI Học Văn 10 — Exam',
  '/exam/mock': 'AI Học Văn 10 — Mock Exam',
  '/writing': 'AI Học Văn 10 — Writing',
  '/dictionary': 'AI Học Văn 10 — Dictionary',
  '/flashcards': 'AI Học Văn 10 — Flashcards',
  '/mindmap': 'AI Học Văn 10 — Mindmap',
  '/study-plan': 'AI Học Văn 10 — Study Plan',
  '/settings': 'AI Học Văn 10 — Settings',
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user, role, signOutUser } = useAuth();

  useEffect(() => {
    const title = titleMap[location.pathname] ?? 'AI Học Văn 10';
    document.title = title;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-stone-50">
      <TopNav />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Breadcrumbs />
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-stone-900">{user.displayName || user.username}</p>
                <p className="text-xs text-stone-500">{role === 'admin' ? 'Admin' : 'Student'}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-sm font-semibold text-stone-600">
                {(user.displayName || user.username || 'U').slice(0, 1).toUpperCase()}
              </div>
              {role === 'admin' && (
                <Link
                  to="/adminpanel"
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => signOutUser()}
                className="rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="text-sm text-stone-500">Chưa đăng nhập</div>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import App from './App';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import AdminOverviewPage from '../features/adminpanel/pages/AdminOverviewPage';
import AdminUsagePage from '../features/adminpanel/pages/AdminUsagePage';
import AdminUsersPage from '../features/adminpanel/pages/AdminUsersPage';
import AdminUserDetailPage from '../features/adminpanel/pages/AdminUserDetailPage';
import AdminClassesPage from '../features/adminpanel/pages/AdminClassesPage';
import AdminAssignmentsPage from '../features/adminpanel/pages/AdminAssignmentsPage';
import AdminSubmissionsPage from '../features/adminpanel/pages/AdminSubmissionsPage';
import AdminSafetyPage from '../features/adminpanel/pages/AdminSafetyPage';
import AdminSystemPage from '../features/adminpanel/pages/AdminSystemPage';

const AppRouter: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <BrowserRouter>
      {!apiBaseUrl && (
        <div className="bg-red-100 px-4 py-3 text-center text-sm font-semibold text-red-700">
          Missing VITE_API_BASE_URL. API requests will fail until this environment variable is set.
        </div>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<App />} />
          <Route path="chat" element={<App />} />
          <Route path="roleplay" element={<App />} />
          <Route path="exam" element={<App />} />
          <Route path="exam/mock" element={<App />} />
          <Route path="writing" element={<App />} />
          <Route path="dictionary" element={<App />} />
          <Route path="flashcards" element={<App />} />
          <Route path="mindmap" element={<App />} />
          <Route path="study-plan" element={<App />} />
          <Route path="settings" element={<App />} />
        </Route>
        <Route
          path="/adminpanel"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/adminpanel/overview" replace />} />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="usage" element={<AdminUsagePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:uid" element={<AdminUserDetailPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="assignments" element={<AdminAssignmentsPage />} />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
          <Route path="safety" element={<AdminSafetyPage />} />
          <Route path="system" element={<AdminSystemPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;

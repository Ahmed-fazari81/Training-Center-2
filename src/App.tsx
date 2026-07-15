import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Toaster } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  isPasswordPage?: boolean;
}

function ProtectedRoute({ children, allowedRoles, isPasswordPage = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // إجبار المستخدم على تغيير كلمة المرور - لا يمكن تجاهلها أو تخطيها
  if (user.requirePasswordChange && !isPasswordPage) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'مسؤول النظام') return <Navigate to="/admin" replace />;
    if (user.role === 'رئيس القسم') return <Navigate to="/manager" replace />;
    return <Navigate to="/employee" replace />;
  }

  return <>{children}</>;
}

import InstallPrompt from './components/InstallPrompt';

export default function App() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // If offline, block app usage and show an overlay message.
  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <h1 className="text-xl font-bold mb-2">التطبيق يتطلب اتصال بالإنترنت</h1>
          <p className="text-sm text-slate-600 mb-4">عذراً، لا يمكن استخدام التطبيق بدون اتصال إنترنت. الرجاء إعادة المحاولة عند الاتصال.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-sky-600 text-white font-medium"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <InstallPrompt />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* صفحة تغيير كلمة المرور الإجبارية - خارج الـ Layout، لا يمكن تجاهلها */}
        <Route path="/change-password" element={
          <ProtectedRoute isPasswordPage={true}>
            <ChangePassword />
          </ProtectedRoute>
        } />

        <Route path="/" element={<Layout />}>
          <Route index element={
            <ProtectedRoute>
              <Navigate to="/employee" replace />
            </ProtectedRoute>
          } />

          <Route path="employee" element={
            <ProtectedRoute allowedRoles={['الموظف', 'رئيس القسم', 'مسؤول النظام']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          <Route path="manager/*" element={
            <ProtectedRoute allowedRoles={['رئيس القسم', 'مسؤول النظام']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />

          <Route path="admin/*" element={
            <ProtectedRoute allowedRoles={['مسؤول النظام']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* صفحة تغيير كلمة المرور الاختيارية - داخل الـ Layout للمستخدمين النشطين */}
          <Route path="settings/change-password" element={
            <ProtectedRoute>
              <ChangePassword isSettingsMode />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

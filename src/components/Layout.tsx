import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Toaster } from 'react-hot-toast';
import { LogOut, User as UserIcon, Home, Bell, Users, Settings, KeyRound } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <Navigate to="/login" replace />;

  const getNavLinks = () => {
    if (user.role === 'مسؤول النظام') {
      return [
        { name: 'إدارة الموظفين', path: '/admin', icon: Users },
      ];
    }
    if (user.role === 'رئيس القسم') {
      return [
        { name: 'الطلبات المعلقة', path: '/manager', icon: Bell },
        { name: 'موظفو القسم', path: '/manager/employees', icon: Users },
      ];
    }
    return [
      { name: 'لوحة التحكم', path: '/employee', icon: Home },
    ];
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="bg-sky-700 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">مركز التدريب</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm bg-sky-800/50 px-3 py-1.5 rounded-full">
                <UserIcon className="w-4 h-4" />
                <span>
                  {user.fullName}
                  {user.fullName.includes(user.role) ? '' : ` (${user.role})`}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-sky-600 rounded-full transition-colors flex items-center gap-2 text-sm"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col sm:flex-row gap-6">

        {/* Sidebar/Nav for Desktop */}
        <nav className="hidden sm:flex flex-col w-64 bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden h-fit">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <p className="font-semibold text-slate-700">القائمة الرئيسية</p>
          </div>
          <div className="p-2 flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-right",
                    active
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", active ? "text-sky-600" : "text-slate-400")} />
                  {link.name}
                </button>
              );
            })}
          </div>

          {/* قسم الإعدادات في أسفل القائمة */}
          <div className="p-2 border-t border-slate-100 mt-1">
            <p className="text-xs font-semibold text-slate-400 px-3 py-1 uppercase tracking-wide">الإعدادات</p>
            <button
              onClick={() => navigate('/settings/change-password')}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-right mt-1",
                isActive('/settings/change-password')
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <KeyRound className={clsx("w-5 h-5", isActive('/settings/change-password') ? "text-sky-600" : "text-slate-400")} />
              تغيير كلمة المرور
            </button>
          </div>
        </nav>

        {/* Mobile Nav (Bottom Bar) */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-20 pb-safe">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={clsx(
                  "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors min-w-[4rem]",
                  active ? "text-sky-700" : "text-slate-500"
                )}
              >
                <Icon className={clsx("w-6 h-6", active ? "text-sky-600" : "text-slate-400")} />
                {link.name}
              </button>
            );
          })}
          {/* زر تغيير كلمة المرور في شريط الموبايل */}
          <button
            onClick={() => navigate('/settings/change-password')}
            className={clsx(
              "flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors min-w-[4rem]",
              isActive('/settings/change-password') ? "text-sky-700" : "text-slate-500"
            )}
          >
            <KeyRound className={clsx("w-6 h-6", isActive('/settings/change-password') ? "text-sky-600" : "text-slate-400")} />
            كلمة المرور
          </button>
        </nav>

        {/* Page Content */}
        <main className="flex-1 pb-20 sm:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

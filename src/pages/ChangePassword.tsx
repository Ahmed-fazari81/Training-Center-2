import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiCall } from '../lib/api';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { KeyRound, ShieldCheck } from 'lucide-react';

interface ChangePasswordProps {
  isSettingsMode?: boolean; // وضع الإعدادات الاختياري (من داخل الحساب)
}

export default function ChangePassword({ isSettingsMode = false }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  // استخدام Navigate كـ component بدلاً من استدعاء navigate() أثناء الـ render
  // (استدعاء navigate أثناء الـ render يخالف قواعد React ويسبب تحذيرات/أخطاء)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('الرجاء تعبئة جميع الحقول');
      return;
    }

    if (newPassword.length < 4) {
      toast.error('يجب أن تكون كلمة المرور الجديدة 4 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCall('auth.changePassword', {
        employeeId: user.employeeId,
        currentPassword,
        newPassword,
      });

      if (response.success) {
        toast.dismiss(); // إغلاق أي إشعارات سابقة فوراً
        toast.success('تم تغيير كلمة المرور بنجاح', { duration: 2500 });
        updateUser({ requirePasswordChange: false });

        if (isSettingsMode) {
          // الرجوع للصفحة السابقة في حالة الإعدادات الاختيارية
          navigate(-1);
        } else {
          // التوجيه للوحة التحكم الرئيسية بعد تغيير كلمة المرور الإجبارية
          if (user.role === 'مسؤول النظام') navigate('/admin');
          else if (user.role === 'رئيس القسم') navigate('/manager');
          else navigate('/employee');
        }
      } else {
        toast.error(response.message || 'فشل تغيير كلمة المرور');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== وضع الإجبار (أول دخول بكلمة المرور الافتراضية) =====
  if (!isSettingsMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* رأس الصفحة */}
          <div className="bg-amber-500 px-6 py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 p-3 rounded-full">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">تغيير كلمة المرور</h1>
            <p className="text-amber-100 text-sm">
              لحماية حسابك، يجب تعيين كلمة مرور جديدة قبل المتابعة
            </p>
          </div>

          {/* تنبيه */}
          <div className="mx-6 mt-5 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
            <p className="text-sm text-amber-800">
              أنت تستخدم كلمة المرور الافتراضية. يجب تغييرها الآن للوصول إلى النظام.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                كلمة المرور الحالية (الافتراضية)
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="أدخل كلمة المرور الافتراضية"
                dir="ltr"
                autoComplete="current-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="أدخل كلمة المرور الجديدة (4 أحرف على الأقل)"
                dir="ltr"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                placeholder="أعد إدخال كلمة المرور الجديدة"
                dir="ltr"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Spinner /> : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  حفظ كلمة المرور والدخول
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ===== وضع الإعدادات (اختياري من داخل الحساب) =====
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center gap-3">
          <div className="bg-sky-100 p-2 rounded-lg">
            <KeyRound className="w-5 h-5 text-sky-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">تغيير كلمة المرور</h2>
            <p className="text-sm text-slate-500">قم بتحديث كلمة مرورك بشكل منتظم لحماية حسابك</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              dir="ltr"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              dir="ltr"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              dir="ltr"
              autoComplete="new-password"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-6 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Spinner /> : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { apiCall } from '../lib/api';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import { LogIn, X, Send } from 'lucide-react';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // حالة نافذة نسيت كلمة المرور
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotId, setForgotId] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !password) {
      toast.error('الرجاء إدخال الرقم الوظيفي وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCall("auth.login", { employeeId, password });

      if (response.success && response.data) {
        login(response.data);
        // فحص ما إذا كان يجب على المستخدم تغيير كلمة المرور
        const needsChange = response.data.requirePasswordChange || response.data.forceChangePassword;
        if (needsChange) {
          navigate('/change-password');
        } else {
          if (response.data.role === 'مسؤول النظام') navigate('/admin');
          else if (response.data.role === 'رئيس القسم') navigate('/manager');
          else navigate('/employee');
        }
      } else {
        toast.error(response.message || 'بيانات الدخول غير صحيحة');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotId.trim()) {
      toast.error('الرجاء إدخال الرقم الوظيفي');
      return;
    }

    setIsForgotLoading(true);
    try {
      const response = await apiCall("auth.resetPassword", { employeeId: forgotId.trim() });

      if (response.success) {
        toast.success('تم إرسال كلمة المرور المؤقتة إلى بريدك الإلكتروني المسجل في النظام');
        setForgotOpen(false);
        setForgotId('');
      } else {
        toast.error(response.message || 'لم يتم العثور على الرقم الوظيفي في النظام');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 py-10"
      style={{
        background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
      }}
    >
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center">
        {/* الشعار (بدون إطار) */}
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="شعار المركز"
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain mb-4"
        />

        {/* العنوان الرئيسي */}
        <p className="text-sky-200 text-sm font-medium tracking-widest uppercase mb-1">
          وزارة التعليم
        </p>
        <h1 className="text-white text-xl sm:text-2xl font-bold leading-snug mb-2 text-center">
          مركز التدريب
        </h1>
        <div className="w-12 h-0.5 bg-sky-400/60 mb-3 rounded-full" />
        <p className="text-sky-300 text-sm font-light tracking-wide mb-8 text-center">
          تسجيل الدخول إلى النظام
        </p>

        {/* نموذج الدخول */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-semibold text-sky-100 mb-2">
              الرقم الوظيفي
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm focus:bg-white focus:text-slate-800 focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all outline-none text-white placeholder-sky-200"
              placeholder="أدخل الرقم الوظيفي"
              dir="ltr"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sky-100 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm focus:bg-white focus:text-slate-800 focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all outline-none text-white placeholder-sky-200"
              placeholder="أدخل كلمة المرور"
              dir="ltr"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-sky-900 font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md hover:shadow-lg active:scale-[0.98] bg-white hover:bg-sky-50"
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                دخول
              </>
            )}
          </button>

          {/* رابط نسيت كلمة المرور */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => { setForgotOpen(true); setForgotId(''); }}
              className="text-sm text-sky-200 hover:text-white hover:underline transition-colors"
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        </form>

        {/* السطران التعريفيان */}
        <div className="text-center mt-8 space-y-0.5">
          <p className="text-[11px] text-sky-200/70">فكرة راشد الزعابي مدرب تقنية معلومات</p>
          <p className="text-[11px] text-sky-200/70">تصميم وتنفيذ أحمد الفزاري</p>
        </div>
      </div>

      {/* ===== نافذة نسيت كلمة المرور ===== */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
            {/* رأس النافذة */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">استعادة كلمة المرور</h3>
              <button
                onClick={() => setForgotOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوى النافذة */}
            <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                أدخل رقمك الوظيفي وسيتم إرسال كلمة مرور مؤقتة إلى بريدك الإلكتروني المسجل في النظام.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  الرقم الوظيفي
                </label>
                <input
                  type="text"
                  value={forgotId}
                  onChange={(e) => setForgotId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all outline-none"
                  placeholder="أدخل رقمك الوظيفي"
                  dir="ltr"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="flex-1 px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 font-medium rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' }}
                >
                  {isForgotLoading ? <Spinner /> : (
                    <>
                      <Send className="w-4 h-4" />
                      إرسال
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

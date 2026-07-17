import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // مسار الأيقونة يعتمد على BASE_URL ليعمل تحت مسار فرعي مثل /Training-Center/
  const iconUrl = `${import.meta.env.BASE_URL}icon.png`;

  // helper to detect iOS (for fallback instructions)
  const isIos =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  useEffect(() => {
    // تحقق من علم الرفض المخزن (قيمة تمثل تاريخ الانتهاء)
    const dismissedRaw = localStorage.getItem('install-prompt-dismissed');
    if (dismissedRaw) {
      const dismissedAt = Number(dismissedRaw);
      if (!Number.isNaN(dismissedAt)) {
        if (dismissedAt > Date.now()) {
          // ما زالت مهلة الرفض فعّالة
          return;
        } else {
          // انتهت المهلة - إزالة المفتاح ليُسمح بالظهور مجدداً
          localStorage.removeItem('install-prompt-dismissed');
        }
      } else {
        // قيمة غير متوقعة - ازالتها
        localStorage.removeItem('install-prompt-dismissed');
      }
    }

    // التحقق ما إذا كان التطبيق مثبتاً (يعمل في وضع standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  // Fallback: بعض المتصفحات (خصوصاً iOS) لا تطلق beforeinstallprompt.
  // بعد مهلة قصيرة، إذا لم نستقبل الحدث وكان المستخدم على iOS، نعطي شارة تثبيت تعليمية.
  useEffect(() => {
    const dismissedRaw = localStorage.getItem('install-prompt-dismissed');
    const dismissedAt = dismissedRaw ? Number(dismissedRaw) : 0;
    if (dismissedAt && dismissedAt > Date.now()) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    if (isIos && !deferredPrompt) {
      const t = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [deferredPrompt, isIos]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      // تعليمات لتثبيت التطبيق على iOS
      window.alert(
        'لتثبيت التطبيق على جهاز iOS: اضغط زر المشاركة في سفاري ثم اختر "إضافة إلى الشاشة الرئيسية".',
      );
      setShowBanner(false);
      // نعتبر أن المستخدم اطلع على التعليمات ونمنع الظهور لمدة 7 أيام
      localStorage.setItem('install-prompt-dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDeferredPrompt(null);
    // تخزين اختيار المستخدم لعدم ظهور الإشعار لمدة 7 أيام
    localStorage.setItem('install-prompt-dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* رأس الإشعار */}
        <div className="flex items-center justify-between px-4 py-3 bg-sky-600">
          <div className="flex items-center gap-2 text-white">
            <Download className="w-5 h-5" />
            <span className="text-sm font-bold">تثبيت التطبيق</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* محتوى الإشعار */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <img src={iconUrl} alt="أيقونة التطبيق" className="w-12 h-12 rounded-xl shadow-sm" />
            <div>
              <p className="font-bold text-slate-800 text-sm">مركز التدريب</p>
              <p className="text-xs text-slate-500">وزارة التعليم</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            قم بتثبيت التطبيق على جهازك للوصول السريع والعمل بدون اتصال بالإنترنت.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              لاحقاً
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-3 py-2 text-sm text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)' }}
            >
              <Download className="w-4 h-4" />
              تثبيت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

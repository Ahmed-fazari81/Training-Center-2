/**
 * طبقة الاتصال بخادم Google Apps Script.
 *
 * ملاحظة أمنية: تم نقل رابط السكربت إلى متغيّر بيئة VITE_APPS_SCRIPT_URL.
 * إذا لم يُضبط، نعود إلى الرابط الافتراضي (لأغراض التوافق مع الإصدار الحالي).
 *
 * لإعداده مستقبلاً:
 *   1. أنشئ ملف .env في جذر المشروع
 *   2. أضف السطر: VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
 */

const DEFAULT_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyviqhX_PB7YlnpDw3_ECQHn6W7ogZZLznY4FrLfdUwscE_5GbSvtKJ_6G8tpGAkiZIrg/exec';

const SCRIPT_URL: string =
  (import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined) || DEFAULT_SCRIPT_URL;

/** مهلة افتراضية للطلب (مللي ثانية) - 25 ثانية. */
const DEFAULT_TIMEOUT_MS = 25000;

/** صيغة الاستجابة العامة من الخادم. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/** إنشاء AbortController مع مهلة زمنية. */
function withTimeout(timeoutMs: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(timer),
  };
}

/**
 * استدعاء إجراء على خادم Google Apps Script.
 *
 * @param action اسم الإجراء (مثل "auth.login")
 * @param payload البيانات المرسلة مع الطلب
 * @param timeoutMs مهلة الطلب (اختياري)
 */
export async function apiCall<T = unknown>(
  action: string,
  payload: Record<string, unknown> = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<ApiResponse<T>> {
  const { signal, cancel } = withTimeout(timeoutMs);

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      // استخدام text/plain لتفادي طلب CORS preflight (متطلب من Google Apps Script)
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload }),
      signal,
    });

    if (!response.ok) {
      return {
        success: false,
        message: `استجابة الخادم غير صحيحة: ${response.status}`,
      };
    }

    const result = (await response.json()) as ApiResponse<T>;
    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: 'انتهت مهلة الطلب. تحقق من اتصالك بالإنترنت.' };
    }
    console.error('API Error:', error);
    return { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
  } finally {
    cancel();
  }
}

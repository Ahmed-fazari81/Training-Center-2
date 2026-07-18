/**
 * دوال مساعدة لتنسيق التاريخ والوقت.
 * القيم القادمة من الخادم (Google Sheets عبر Apps Script) قد تصل أحياناً
 * كنصوص ISO كاملة (مثال: 2026-01-15T00:00:00.000Z) بدل تاريخ/وقت بسيط،
 * لذلك نحتاج لتنظيفها قبل العرض حتى لا تظهر رموز غريبة مثل ".000Z" للمستخدم.
 */

/** استخراج جزء التاريخ (YYYY-MM-DD) من أي صيغة نصية واردة، وتنسيقه بالعربية. */
export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const datePart = String(value).split('T')[0]; // ياخذ فقط الجزء قبل T إن وجد
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return datePart; // إن لم تكن الصيغة معروفة، أعرضه كما هو بدون كسر الواجهة
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** استخراج الوقت (HH:MM) من أي صيغة نصية واردة، وتنسيقه بنظام 12 ساعة بالعربية. */
export function formatTime(value?: string | null): string {
  if (!value) return '—';
  let timePart = String(value);
  if (timePart.includes('T')) {
    timePart = timePart.split('T')[1] || '';
  }
  const match = timePart.match(/^(\d{2}):(\d{2})/);
  if (!match) return String(value);
  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hours12}:${minutes} ${period}`;
}

/** إرجاع تاريخ اليوم بصيغة YYYY-MM-DD لاستخدامه كحد أدنى (min) في حقول input[type=date]. */
export function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

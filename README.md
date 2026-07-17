# مركز التدريب - وزارة التعليم (نسخة Training-Center-2)

نظام ويب (PWA) لإدارة خطط عمل مركز التدريب، مبني على React + Vite + Tailwind CSS، ويعتمد على Google Apps Script كخلفية.

> ⚠️ **هذه النسخة مُخصَّصة لمستودع باسم `Training-Center-2` على GitHub Pages.**
> إذا كان مستودعك يحمل اسماً مختلفاً، اقرأ قسم "تغيير اسم المستودع" أدناه.

---

## 🌐 الرابط المباشر

**https://ahmed-fazari81.github.io/Training-Center-2/**

---

## 🔍 سبب الصفحة البيضاء في النسخة السابقة

عند بناء التطبيق بـ Vite، يتم "خبز" قيمة `base` من `vite.config.ts` داخل ملف الـ JS المُجمَّع. هذه القيمة تُستخدم في مكانين حرّين:

1. **`basename` لمكوّن `<BrowserRouter>`** — يُحدد البادئة التي يجب تجاهلها من `window.location.pathname` قبل مطابقة المسارات.
2. **مسار تسجيل Service Worker** — `navigator.serviceWorker.register("/Training-Center/sw.js", {scope: "/Training-Center/"})`.

في النسخة السابقة، كانت هذه القيمة `"/Training-Center/"` (لأن المستودع الأصلي كان بهذا الاسم). لكنك نشرت النسخة الجديدة تحت `Training-Center-2`، فأصبح الـ pathname للمستخدم هو `/Training-Center-2/` بينما الـ basename المُضمَّن في JS لا يزال `/Training-Center/`.

نتيجة لذلك:
- React Router يحاول إزالة `/Training-Center` من `/Training-Center-2/`، لكنه ليس بادئة → لا تطابق → صفحة بيضاء.
- Service Worker يحاول التسجيل من `/Training-Center/sw.js` (مستودع قديم) بدلاً من `/Training-Center-2/sw.js` → فشل التسجيل.

## ✅ الحل المُطبَّق في هذه النسخة

تم ترقيع ملف `assets/index-ZpCq1z9g.js` باستبدال جميع تواجدات `/Training-Center/` بـ `/Training-Center-2/`:

| الموقع | قبل | بعد |
|--------|-----|------|
| basename | `"/Training-Center/"` | `"/Training-Center-2/"` |
| SW URL | `"/Training-Center/sw.js"` | `"/Training-Center-2/sw.js"` |
| SW scope | `"/Training-Center/"` | `"/Training-Center-2/"` |

كما تم تحديث `vite.config.ts` ليعكس `base: '/Training-Center-2/'` (مهم لو أردت إعادة البناء مستقبلاً).

---

## 📁 هيكل المشروع

```
Training-Center-2/
├── .nojekyll              ← يمنع معالجة Jekyll
├── .env.example
├── .gitignore
├── 404.html               ← دعم Ctrl+F5 على المسارات الفرعية
├── README.md              ← هذا الملف
├── index.html             ← نقطة الدخول (مسارات نسبية)
├── manifest.json
├── sw.js                  ← Service Worker
├── icon.png
├── icon-512.png
├── logo.png
├── package.json
├── tsconfig.json
├── vite.config.ts         ← base: '/Training-Center-2/'
├── assets/
│   ├── index-ZpCq1z9g.js  ← ✅ مُرقَّع لـ /Training-Center-2/
│   └── index-DF-orJmT.css
└── src/                   ← الكود المصدري
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components/
    │   ├── Layout.tsx
    │   ├── InstallPrompt.tsx
    │   └── ui/Spinner.tsx
    ├── lib/api.ts
    ├── store/authStore.ts
    └── pages/
        ├── Login.tsx
        ├── ChangePassword.tsx
        ├── AdminDashboard.tsx
        ├── ManagerDashboard.tsx
        └── EmployeeDashboard.tsx
```

---

## 🚀 طريقة الرفع

### الخيار 1: رفع مباشر عبر واجهة GitHub (الأسهل)

1. فك ضغط ملف الـ ZIP.
2. اذهب إلى: `https://github.com/Ahmed-Fazari81/Training-Center-2`
3. احذف كل الملفات الحالية في المستودع.
4. ارفع جميع ملفات هذه النسخة.
5. انتظر 1-2 دقيقة حتى يُعيد GitHub Pages البناء.
6. افتح الرابط: `https://ahmed-fazari81.github.io/Training-Center-2/`
7. **مهم**: اضغط **Ctrl+Shift+R** (تحديث صعب مع تجاوز الكاش) لتنظيف أي نسخة قديمة من Service Worker.

### الخيار 2: عبر Git CLI

```bash
git clone https://github.com/Ahmed-Fazari81/Training-Center-2.git
cd Training-Center-2

# حذف كل المحتوى القديم (عدا .git)
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +

# نسخ ملفات النسخة الجديدة إلى هنا
# (بعد فك ضغط الـ ZIP في مجلد مؤقت)
cp -r /path/to/training-center-2-patch/* .
cp /path/to/training-center-2-patch/.nojekyll .
cp /path/to/training-center-2-patch/.env.example .
cp /path/to/training-center-2-patch/.gitignore .

git add .
git commit -m "إصلاح basename ليعمل تحت /Training-Center-2/"
git push origin main
```

---

## 🧹 خطوة مهمة بعد الرفع: تنظيف Service Worker القديم

إذا كنت قد زرت النسخة السابقة (الصفحة البيضاء)، قد يكون المتصفح لديك قد سجَّل Service Worker قديم أو خزّن نسخة معطوبة. لتنظيف ذلك:

### في Chrome / Edge:
1. افتح `https://ahmed-fazari81.github.io/Training-Center-2/`
2. اضغط **F12** لفتح أدوات المطور
3. اذهب إلى تبويب **Application**
4. في الشريط الجانبي الأيسر:
   - **Service Workers** → اضغط **Unregister** على أي SW موجود
   - **Storage** → اضغط **Clear site data**
5. أغلق أدوات المطور واضغط **Ctrl+Shift+R**

### في Firefox:
1. اضغط **F12**
2. اذهب إلى **Storage** → **Service Workers**
3. احذف أي SW موجود
4. اضغط **Ctrl+F5**

---

## 🔄 تغيير اسم المستودع (لو رغبت لاحقاً)

إذا أردت تغيير اسم المستودع من `Training-Center-2` إلى اسم آخر (مثلاً `training-center`), يجب عليك:

1. في GitHub: **Settings → Repository name → Rename**
2. تحديث `vite.config.ts`:
   ```ts
   base: '/training-center/',  // الاسم الجديد
   ```
3. **إعادة بناء المشروع** بـ `npm install && npm run build`
4. نسخ محتوى `docs/` إلى جذر المستودع ورفعه
5. تحديث رابط GitHub Pages في الإعدادات

> 💡 **البديل الأبسط**: إذا لم تكن ترغب في إعادة البناء في كل مرة، استخدم **HashRouter** بدلاً من BrowserRouter. لكن هذا يتطلب تعديل `src/App.tsx` وإعادة البناء مرة واحدة على الأقل.

---

## 🛠️ إعادة البناء من المصدر (اختياري)

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. تشغيل وضع التطوير
npm run dev
# افتح http://localhost:3000

# 3. البناء للإنتاج (المخرجات في docs/)
npm run build

# 4. انسخ محتويات docs/ إلى جذر المستودع وارفعها
```

---

## ⚙️ إعدادات GitHub Pages

في صفحة المستودع:
1. **Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / **Folder**: `/ (root)`
4. **Save**

---

## 🧩 ملخص الإصلاحات في هذه النسخة

| # | الإصلاح |
|---|---------|
| 1 | ✅ ترقيع basename في JS من `/Training-Center/` إلى `/Training-Center-2/` |
| 2 | ✅ ترقيع مسار Service Worker من `/Training-Center/sw.js` إلى `/Training-Center-2/sw.js` |
| 3 | ✅ تحديث `vite.config.ts` بـ `base: '/Training-Center-2/'` |
| 4 | ✅ إضافة `404.html` (دعم Ctrl+F5 على المسارات الفرعية) |
| 5 | ✅ إضافة `.nojekyll` |
| 6 | ✅ تصحيح خطأ "وزراة" إلى "وزارة" في `index.html` |
| 7 | ✅ مسارات نسبية `./assets/...` في `index.html` |
| 8 | ✅ تحسين `manifest.json` و `sw.js` |
| 9 | ✅ تحسين `api.ts` (TypeScript + timeout + env var) |
| 10 | ✅ إصلاح `ChangePassword.tsx` (Navigate component) |
| 11 | ✅ إصلاح `InstallPrompt.tsx` (BASE_URL للأيقونة) |
| 12 | ✅ تنظيف `package.json` و `tsconfig.json` و `.gitignore` |
| 13 | ✅ إضافة `.env.example` |

---

## 📞 الدعم

إذا استمرت المشكلة بعد رفع هذه النسخة:
1. تأكد من تنظيف Service Worker القديم (كما هو موضح أعلاه)
2. جرّب في وضع التصفح الخفي (Incognito)
3. افتح Console (F12) وانسخ أي رسائل خطأ حمراء وأرسلها لي

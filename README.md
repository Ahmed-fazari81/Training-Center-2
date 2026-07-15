# مركز التدريب - وزارة التعليم

نظام ويب (PWA) لإدارة خطط عمل مركز التدريب، مبني على React + Vite + Tailwind CSS، ويعتمد على Google Apps Script كخلفية.

---

## 🚀 النشر على GitHub Pages

الموقع منشور حالياً على:
**https://ahmed-fazari81.github.io/Training-Center/**

### ⚠️ السبب الجذري لمشكلة 404 عند Ctrl+F5

عند فتح الموقع والتنقل داخل التطبيق (مثلاً الذهاب إلى صفحة الموظف)، يتغيّر الرابط في المتصفح إلى:

```
https://ahmed-fazari81.github.io/Training-Center/employee
```

عند الضغط على **Ctrl+F5** (تحديث صعب)، يطلب المتصفح هذا المسار من خادم GitHub Pages حرفياً. لكن GitHub Pages لا يوجد لديه ملف فيزيائي بهذا المسار (لأن التطبيق يعمل بـ Client-Side Routing)، فيُرجع **404**.

### ✅ الحل المطبّق في هذه النسخة

أُضيف ملف **`404.html`** في جذر المستودع. عندما يواجه GitHub Pages مساراً غير موجود، يُرجع هذا الملف بدلاً من صفحة 404 الافتراضية. يحتوي الملف على سكربت صغير يقوم بـ:

1. التقاط المسار المطلوب (مثل `/Training-Center/employee`).
2. تحويله إلى معامل بحث (`?p=/employee`).
3. إعادة التوجيه إلى `index.html`.
4. يقرأ `index.html` هذا المعامل ويُعيد بناء المسار عبر `history.replaceState`.

بهذا، يعمل التحديث الصعب (Ctrl+F5) على أي مسار داخل التطبيق.

---

## 📁 هيكل المشروع

```
Training-Center/
├── .nojekyll              ← يمنع معالجة Jekyll على GitHub Pages
├── .env.example           ← قالب متغيرات البيئة
├── .gitignore
├── 404.html               ← ✨ حلاً لمشكلة التحديث الصعب
├── README.md              ← هذا الملف
├── index.html             ← نقطة الدخول (HTML)
├── manifest.json          ← بيانات PWA
├── sw.js                  ← Service Worker (دعم Offline + PWA)
├── icon.png               ← أيقونة 192×192
├── icon-512.png           ← أيقونة 512×512
├── logo.png               ← الشعار
├── package.json
├── tsconfig.json
├── vite.config.ts
├── assets/                ← الملفات المبنية (JS/CSS)
│   ├── index-ZpCq1z9g.js
│   └── index-DF-orJmT.css
├── public/                ← أصول Vite المصدرية (تُنسخ تلقائياً للـ build)
│   ├── icon.png
│   ├── icon-512.png
│   ├── logo.png
│   ├── manifest.json
│   └── sw.js
└── src/                   ← الكود المصدري
    ├── App.tsx            ← التعريف الرئيسي + Routing
    ├── main.tsx           ← نقطة الدخول React + تسجيل SW
    ├── index.css          ← Tailwind + RTL + Animations
    ├── components/
    │   ├── Layout.tsx
    │   ├── InstallPrompt.tsx
    │   └── ui/Spinner.tsx
    ├── lib/
    │   └── api.ts         ← طبقة الاتصال بـ Google Apps Script
    ├── store/
    │   └── authStore.ts   ← Zustand + persist
    └── pages/
        ├── Login.tsx
        ├── ChangePassword.tsx
        ├── AdminDashboard.tsx
        ├── ManagerDashboard.tsx
        └── EmployeeDashboard.tsx
```

---

## 🔧 طريقة الرفع إلى GitHub

### الخيار 1: رفع الملفات مباشرة (الأسهل)

1. حمّل ملف الـ ZIP لهذه النسخة وفك ضغطه.
2. اذهب إلى مستودعك على GitHub:
   `https://github.com/Ahmed-Fazari81/Training-Center`
3. احذف كل الملفات الحالية في المستودع (عدا `.git` إن كان ظاهراً).
4. ارفع جميع ملفات هذه النسخة مكانها.
5. تأكد من أن ملف **`404.html`** موجود في جذر المستودع (هذا هو الأهم).
6. انتظر دقيقتين تقريباً حتى يعيد GitHub Pages البناء.
7. افتح الرابط وجرب الضغط على Ctrl+F5 في أي صفحة داخلية.

### الخيار 2: عبر سطر الأوامر (Git)

```bash
# استنساخ المستودع
git clone https://github.com/Ahmed-Fazari81/Training-Center.git
cd Training-Center

# حذف كل المحتوى القديم (عدا .git)
find . -mindepth 1 -maxdepth 1 -not -name '.git' -exec rm -rf {} +

# نسخ ملفات النسخة الجديدة إلى هذا المجلد
# (بعد فك ضغط الـ ZIP في مجلد مؤقت)
cp -r /path/to/training-center-fixed/* .
cp -r /path/to/training-center-fixed/.nojekyll .
cp -r /path/to/training-center-fixed/.env.example .
cp -r /path/to/training-center-fixed/.gitignore .

# إضافة وتثبيت ورفع
git add .
git commit -m "إصلاح مشكلة 404 عند التحديث + تنظيف المشروع"
git push origin main
```

---

## 🛠️ إعادة البناء محلياً (اختياري)

إذا أردت تعديل الكود وإعادة البناء:

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. تشغيل وضع التطوير
npm run dev
# افتح http://localhost:3000

# 3. البناء للإنتاج
npm run build
# المخرجات تُكتب في مجلد docs/ (حسب vite.config.ts)
```

بعد البناء، انسخ محتويات `docs/` إلى جذر المستودع وارفعها.

---

## ⚙️ إعدادات GitHub Pages

تأكد من إعدادات المستودع:
1. اذهب إلى **Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / **Folder**: `/ (root)`
4. اضغط **Save**

---

## 🧩 الإصلاحات المطبّقة في هذه النسخة

| # | الملف | المشكلة | الإصلاح |
|---|------|---------|---------|
| 1 | `404.html` | غائب - سبب الـ 404 عند Ctrl+F5 | ✅ إضافة ملف مع SPA redirect trick |
| 2 | `.nojekyll` | غائب | ✅ إضافته لمنع معالجة Jekyll |
| 3 | `index.html` | خطأ إملائي "وزراة" + مسارات مطلقة | ✅ تصحيح "وزارة" + مسارات نسبية `./assets/` |
| 4 | `index.html` | `?p=` redirect ناقص | ✅ معالجة `?q=` (query string) و `~and~` encoding |
| 5 | `manifest.json` | نقص حقول | ✅ إضافة `description`, `lang`, `dir`, `orientation`, `purpose` |
| 6 | `sw.js` | لا يفرّق طلبات التنقل | ✅ Network-First للملاحة + fallback إلى index.html |
| 7 | `package.json` | اعتماديات غير مستخدمة + اسم خاطئ | ✅ إزالة express, genai, dotenv + تصحيح الاسم |
| 8 | `vite.config.ts` | أكواد AI Studio زائدة | ✅ تبسيط |
| 9 | `tsconfig.json` | `experimentalDecorators` غير ضروري | ✅ تفعيل strict mode |
| 10 | `src/lib/api.ts` | `any` types + لا timeout + URL مكشوف | ✅ TypeScript generics + AbortController + env var |
| 11 | `src/pages/ChangePassword.tsx` | `navigate()` أثناء render (React anti-pattern) | ✅ استبدال بـ `<Navigate>` |
| 12 | `src/components/InstallPrompt.tsx` | مسار `/icon.png` مطلق | ✅ استخدام `import.meta.env.BASE_URL` |
| 13 | `.gitignore` | يحتوي على ملفات `.bak` | ✅ تنظيف |
| 14 | `.env.example` | لم يذكر `VITE_APPS_SCRIPT_URL` | ✅ إضافته |
| 15 | `metadata.json` | زائد من AI Studio | ✅ حُذف |
| 16 | `src/index.css.bak` | ملف backup | ✅ حُذف |

---

## 🔐 ملاحظات أمنية

- رابط Google Apps Script حالياً مُضمَّن في الكود كقيمة افتراضية للتوافق مع الإصدار الحالي. يُفضّل نقله إلى `.env` كـ `VITE_APPS_SCRIPT_URL` (ملف `api.ts` معدّ لذلك).
- بيانات المستخدم تُخزَّن في `localStorage` عبر Zustand persist - مقبول لهذا النطاق من التطبيق لكنه ليس آمناً لبيانات حساسة جداً.
- لا توجد حماية CSRF على مستوى الواجهة، لكن Google Apps Script نفسه يوفّر بعض العزل.

---

## 📞 الدعم

للمساعدة في النشر أو تعديل الكود، راجع GitHub Pages docs:
https://docs.github.com/en/pages

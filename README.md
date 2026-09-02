# بوتيك العرايس — Firebase Production App

تحويل التطبيق من نسخة العرض التجريبي (اللي كانت تعتمد على `window.storage`) إلى تطبيق ويب حقيقي جاهز للنشر على Firebase Hosting، بقاعدة بيانات Cloud Firestore حقيقية، تسجيل دخول، ورفع صور فعلي عبر Firebase Storage.

---

## ⚠️ مهم جداً — لم يتم تنفيذ Build فعلي

بيئة العمل التي أنشأتُ فيها هذا المشروع **لا تملك اتصال إنترنت** (تم التحقق من ذلك)، لذلك لم أستطع تشغيل `npm install` أو `npm run build` أو `firebase deploy` فعلياً، ولا التحقق من عدم وجود أخطاء Build بنفسي.

كل الملفات مكتوبة يدوياً وبعناية ومتوافقة مع بعضها منطقياً (تم التحقق من توازن الأقواس وعدم وجود أي استدعاء لدوال أو استيرادات محذوفة)، لكن **يجب عليك تشغيل الأوامر أدناه بنفسك على جهازك** للتأكد من أن الـ Build نظيف قبل النشر.

---

## 1. سبب المشكلة الحالية

النسخة القديمة كانت تعمل فقط داخل بيئة Claude (تستخدم `window.storage`، وهي API خاصة بمنصة Claude غير موجودة في أي متصفح عادي)، ولم يكن فيها:
- قاعدة بيانات حقيقية يشتركها عدة أجهزة
- تسجيل دخول
- رفع صور حقيقي (كانت الصور تُحفظ كنص Base64 داخل نفس مخزن `window.storage`)
- استدعاء الذكاء الاصطناعي كان مباشرة من المتصفح — في تطبيق حقيقي هذا يتطلب مفتاح API حقيقي، ولا يجوز وضعه في كود الواجهة الأمامية لأن أي شخص يقدر يفتحه من أدوات المتصفح ويسرقه ويستخدمه على حسابك.

هذا المشروع يحل الثلاثة:
- `window.storage` → **Cloud Firestore** (تزامن حقيقي بين الأجهزة، realtime)
- الصور Base64 → **Firebase Storage** (روابط تحميل حقيقية)
- استدعاء الذكاء الاصطناعي المباشر → **Cloud Function** بمفتاح API محفوظ في Secret Manager، الواجهة لا تعرف المفتاح إطلاقاً

---

## 2. بنية المشروع

```
bridal-firebase/
├── package.json
├── vite.config.js
├── index.html
├── .env.example          ← انسخيه إلى .env.local وعبّي بيانات مشروعك
├── firebase.json
├── .firebaserc           ← غيّري YOUR_FIREBASE_PROJECT_ID
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── src/
│   ├── main.jsx
│   ├── App.jsx            ← بوابة تسجيل الدخول
│   ├── firebase.js         ← تهيئة Firebase (Firestore/Auth/Storage/Functions)
│   ├── auth/Login.jsx
│   ├── lib/
│   │   ├── customers.js    ← كل عمليات العميلات (CRUD + realtime + كود تلقائي آمن)
│   │   ├── images.js       ← رفع/حذف الصور في Storage
│   │   ├── settings.js     ← الألوان وتفضيلات لوحة التحكم
│   │   └── aiReview.js     ← استدعاء المساعد الذكي عبر Cloud Function
│   └── components/
│       └── BridalApp.jsx   ← كل واجهة التطبيق (نفس التصميم والوظائف السابقة)
├── functions/
│   ├── package.json
│   └── index.js            ← Cloud Function: reviewCustomerData (تستدعي Anthropic بأمان)
└── dist/                    ← يُنشأ تلقائياً بعد npm run build (لا يوجد الآن)
```

**الملفات الجديدة بالكامل:** كل شيء أعلاه — هذا مشروع جديد كامل، وليس تعديلاً على ملف واحد.

---

## 3. التثبيت والتشغيل المحلي

```bash
cd bridal-firebase
npm install
cp .env.example .env.local
# افتحي .env.local وعبّي القيم من Firebase Console (خطوة 4 تحت)
npm run dev
```

يفتح على `http://localhost:5173`. تسجيل الدخول لن يعمل قبل إنشاء مستخدم في Firebase Auth (خطوة 5).

## 4. إعداد مشروع Firebase (مرة واحدة)

1. اذهبي إلى [console.firebase.google.com](https://console.firebase.google.com) → **إنشاء مشروع جديد**.
2. من **Project settings → General → Your apps** أضيفي **Web app** (أيقونة `</>`)، وانسخي القيم الظاهرة (`apiKey`, `authDomain`, ...) إلى ملف `.env.local`.
3. فعّلي الخدمات التالية من القائمة الجانبية:
   - **Firestore Database** → Create database → ابدئي بـ *production mode* (القواعد جاهزة في `firestore.rules`).
   - **Authentication** → Sign-in method → فعّلي **Email/Password**.
   - **Storage** → Get started (نفس الحساب/المنطقة).
   - **Functions** → يحتاج مشروعك أن يكون على خطة **Blaze** (Pay-as-you-go) — Cloud Functions لا تعمل على الخطة المجانية. لن تُحاسبي فعلياً إلا إذا تجاوزتِ الحد المجاني السخي أصلاً.
4. في `.firebaserc` استبدلي `YOUR_FIREBASE_PROJECT_ID` بمعرّف مشروعك الفعلي (تجدينه في Project settings).

## 5. إنشاء حسابات الموظفات (تسجيل الدخول)

التطبيق **لا يحتوي شاشة تسجيل حساب جديد** عمداً (لتفادي أي شخص يسجل نفسه من الرابط العام). أنشئي حساب لكل موظفة يدوياً:

**Firebase Console → Authentication → Users → Add user** → أدخلي بريد إلكتروني وكلمة مرور. كرري هذا لكل جوال من الـ 4-5 جوالات (كل موظفة بحسابها، أو استخدمي نفس الحساب على أكثر من جوال — كلاهما يعمل).

## 6. ربط Firebase CLI ونشر المشروع

```bash
npm install -g firebase-tools     # مرة واحدة على جهازك
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID

# مفتاح الذكاء الاصطناعي (مرة واحدة، قبل أول نشر لـ functions):
firebase functions:secrets:set ANTHROPIC_API_KEY
# الصقي مفتاحك من https://console.anthropic.com/settings/keys عند الطلب

npm run build          # ينتج مجلد dist/ يحتوي index.html + assets/ + JS/CSS
firebase deploy        # ينشر Hosting + Firestore rules + Storage rules + Functions معاً
```

بعدها تحصلين على رابط بالشكل: `https://YOUR_FIREBASE_PROJECT_ID.web.app`

للتأكد أن `firebase.json` يشير للمجلد الصحيح (وليس فارغاً): بعد `npm run build` تأكدي يدوياً أن `dist/index.html` و`dist/assets/*.js` و`dist/assets/*.css` موجودة فعلياً قبل تشغيل `firebase deploy`.

### نشر جزء واحد فقط (بعد أول نشر كامل)
```bash
firebase deploy --only hosting        # بعد تعديل الواجهة فقط
firebase deploy --only functions      # بعد تعديل functions/index.js
firebase deploy --only firestore:rules,storage:rules   # بعد تعديل الصلاحيات
```

---

## 7. Firestore Security Rules (موجودة في `firestore.rules`)

- `customers/*` و `settings/*`: أي مستخدم داخل الحساب (Firebase Auth) يقدر يقرأ ويكتب — لأن هذا تطبيق داخلي لبوتيك واحد وليس متعدد المستأجرين.
- `system/aiReview`: القراءة فقط للمستخدمين، والكتابة محجوبة تماماً من العميل — فقط الـ Cloud Function (عبر Admin SDK) يكتب فيها، فلا يقدر أي جهاز يزوّر تنبيهات وهمية.

لو احتجتِ لاحقاً صلاحيات مختلفة حسب الدور (مثلاً المعمل ما يشوف الأرقام المالية)، أضيفي مجموعة `staff/{uid}` فيها حقل `role`، وعدّلي القواعد لتتحقق منه — قلت وضّحتها كتعليق داخل الملف نفسه كنقطة توسّع مستقبلية.

---

## 8. التأكد أن البيانات تتزامن بين 4-5 جوالات

1. افتحي الرابط المنشور من جوالين مختلفين (أو جوال + متصفح لابتوب)، وسجّلي الدخول بنفس الحساب أو حسابين مختلفين.
2. من الجوال الأول: أضيفي عروسة جديدة أو عدّلي مبلغ العربون.
3. راقبي الجوال الثاني — **بدون أي تحديث للصفحة يدوياً** — التغيير المفروض يظهر خلال ثانية أو ثانيتين (هذا Firestore `onSnapshot`، مو استعلام يدوي).
4. لاختبار وضع بدون إنترنت: فعّلي وضع الطيران على جوال، عدّلي بيانات عروسة (تشتغل فوراً محلياً بفضل `persistentLocalCache`)، ثم أطفئي وضع الطيران — التعديل يوصل تلقائياً لباقي الأجهزة خلال لحظات.
5. كود الفستان التلقائي (0001، 0002...) يُحجز عبر Firestore Transaction (`getNextDressCode` في `src/lib/customers.js`) — حتى لو جوالين ضغطوا "عروسة جديدة" في نفس اللحظة تماماً، كل وحدة تاخذ رقم مختلف بدون تصادم.

---

## 9. مفتاح Anthropic API — تنويه مهم

- المساعد الذكي 🤖 كان في نسخة العرض التجريبي يعمل "مجاناً" ضمن بيئة Claude. في هذا التطبيق المستقل، الاستدعاء الآن يتم من **Cloud Function** (`functions/index.js`) وليس من المتصفح، لكنه يحتاج **مفتاح Anthropic API حقيقي وخاص بك**، تحصلين عليه من [console.anthropic.com](https://console.anthropic.com/settings/keys)، وسيتم محاسبتك عليه مباشرة من Anthropic حسب استخدامك الفعلي.
- المفتاح يُخزَّن في **Firebase Secret Manager** (الأمر في خطوة 6)، وليس في أي ملف كود — لا يظهر في `dist/` ولا في أدوات فحص المتصفح إطلاقاً.
- كل ضغطة "🔄 تحديث" على المساعد الذكي = استدعاء واحد لـ Anthropic API (استدعاء تلقائي كل 6 ساعات كحد أقصى إذا الشاشة مفتوحة، وليس على كل فتح للتطبيق).

---

## 10. الملفات المعدَّلة مقابل الجديدة

بما إنه لم يكن هناك ملف `BridalApp(1).tsx` فعلي مرفق في هذه المحادثة (وصلني وصف المتطلبات فقط كنص)، اعتمدتُ على **آخر نسخة من التطبيق التي بنيناها معاً في هذه المحادثة نفسها** كأساس، وحوّلتها بالكامل. عملياً:

- **معدَّل جوهرياً:** `src/components/BridalApp.jsx` — نفس كل التصميم والشاشات والوظائف (الحجوزات، المعمل، المالية، التقارير، المساعد الذكي...)، لكن كل عمليات القراءة/الكتابة تحوّلت من `window.storage` إلى Firestore/Storage عبر ملفات `src/lib/*`.
- **جديد بالكامل:** كل باقي الملفات المذكورة في شجرة المشروع (خطوة 2).

---

## 11. TypeScript

كتبتُ المشروع بجافاسكريبت عادي (`.jsx`) وليس TypeScript (`.tsx`) — النسخة الأصلية التي عملنا عليها في هذه المحادثة كانت `.jsx` من الأساس، وتحويلها الكامل إلى TypeScript (مع كل الأنواع Types) كان سيضاعف حجم العمل بدون فائدة وظيفية مباشرة لك الآن. لو تبين TypeScript لاحقاً، الكود منظم بما يكفي لإضافته تدريجياً (ملف بملف) دون إعادة كتابة كل شيء.

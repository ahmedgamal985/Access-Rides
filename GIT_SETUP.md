# إعداد Git و GitHub للمشروع

## خطوات رفع المشروع إلى GitHub

### 1. تثبيت Git (إذا لم يكن مثبتاً)

#### على Windows:
- اذهب إلى [git-scm.com](https://git-scm.com/download/win)
- حمل وثبت Git
- أعد تشغيل Command Prompt

#### على macOS:
```bash
# باستخدام Homebrew
brew install git

# أو حمل من الموقع الرسمي
# https://git-scm.com/download/mac
```

#### على Linux:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install git

# CentOS/RHEL
sudo yum install git
```

### 2. إعداد Git (للمرة الأولى)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. تهيئة المشروع

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit: Access Rides app with accessibility features"
```

### 4. ربط المشروع بـ GitHub

```bash
# إضافة remote repository
git remote add origin https://github.com/USERNAME/Access-Ride.git

# تغيير اسم الفرع الرئيسي
git branch -M main

# رفع المشروع
git push -u origin main
```

### 5. تحديث المشروع لاحقاً

```bash
# إضافة التغييرات
git add .

# عمل commit
git commit -m "Description of changes"

# رفع التغييرات
git push origin main
```

## ملاحظات مهمة

- استبدل `USERNAME` باسم المستخدم الخاص بك على GitHub
- تأكد من إنشاء repository على GitHub قبل رفع المشروع
- ملف `.gitignore` جاهز ويستبعد الملفات غير الضرورية

## هيكل المشروع

```
Access-Ride/
├── .gitignore          # ملفات مستبعدة من Git
├── README.md           # وثائق المشروع
├── LICENSE             # رخصة المشروع
├── package.json        # تبعيات المشروع
├── App.tsx            # الملف الرئيسي
├── components/        # مكونات React
├── backend/           # الخادم الخلفي
└── types/             # تعريفات TypeScript
```

## الميزات المرفوعة

- ✅ تطبيق React Native كامل
- ✅ نظام النقل الميسر
- ✅ دعم لغة الإشارة
- ✅ نظام المحادثة مع السائق
- ✅ ترجمة رسائل السائق
- ✅ إمكانية الوصول الكاملة
- ✅ واجهة مستخدم متقدمة

## الدعم

إذا واجهت أي مشاكل في رفع المشروع، تأكد من:
1. تثبيت Git بشكل صحيح
2. إنشاء repository على GitHub
3. استخدام URL الصحيح للمشروع
4. وجود اتصال بالإنترنت

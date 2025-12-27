# دليل نظام التصميم الشامل
# Comprehensive Design System Guide

هذا الملف يوثق نظام التصميم المستخدم في تطبيق Log & Ledger Pro بشكل مفصل.
يمكن تطبيق هذا النظام على أي تطبيق ويب آخر.

This document provides a complete design system documentation that can be applied to any web application.

---

## 📚 جدول المحتويات | Table of Contents

1. [الإعداد الأساسي | Basic Setup](#1-الإعداد-الأساسي--basic-setup)
2. [نظام الألوان | Color System](#2-نظام-الألوان--color-system)
3. [الخطوط | Typography](#3-الخطوط--typography)
4. [المسافات والأبعاد | Spacing & Sizing](#4-المسافات-والأبعاد--spacing--sizing)
5. [الظلال | Shadows](#5-الظلال--shadows)
6. [الزوايا | Border Radius](#6-الزوايا--border-radius)
7. [المكونات | Components](#7-المكونات--components)
8. [التجاوب | Responsive Design](#8-التجاوب--responsive-design)
9. [دعم RTL والعربية | RTL & Arabic Support](#9-دعم-rtl-والعربية--rtl--arabic-support)
10. [نظام Elevation | Elevation System](#10-نظام-elevation--elevation-system)

---

## 1. الإعداد الأساسي | Basic Setup

### التقنيات المستخدمة | Technologies Used

```json
{
  "framework": "React 18+",
  "styling": "Tailwind CSS 3.4+",
  "ui-library": "shadcn/ui",
  "fonts": {
    "primary": "Inter",
    "arabic": "Cairo",
    "monospace": "JetBrains Mono"
  }
}
```

### ملفات الإعداد | Configuration Files

#### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0.5625rem",  // 9px
        md: "0.375rem",   // 6px
        sm: "0.1875rem",  // 3px
      },
      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
        arabic: ["Cairo", "Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography")
  ],
} satisfies Config;
```

#### HTML Font Loading
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## 2. نظام الألوان | Color System

### 🎨 النمط الفاتح | Light Mode

جميع الألوان بصيغة HSL (Hue Saturation Lightness)

```css
:root {
  /* ═══════════════════════════════════════════════════════════════
     الخلفيات الأساسية | Primary Backgrounds
     ═══════════════════════════════════════════════════════════════ */
  
  --background: 0 0% 98%;
  /* 
   * RGB: #FAFAFA
   * الاستخدام: خلفية الصفحة الرئيسية
   * Use: Main page background
   */
  
  --foreground: 210 15% 15%;
  /* 
   * RGB: #212832
   * الاستخدام: النص الرئيسي
   * Use: Primary text color
   */

  /* ═══════════════════════════════════════════════════════════════
     البطاقات | Cards
     ═══════════════════════════════════════════════════════════════ */
  
  --card: 210 5% 96%;
  /* 
   * RGB: #F3F4F5
   * الاستخدام: خلفية البطاقات
   * Use: Card background
   */
  
  --card-foreground: 210 15% 15%;
  /* 
   * RGB: #212832
   * الاستخدام: نص البطاقات
   * Use: Card text
   */
  
  --card-border: 210 8% 92%;
  /* 
   * RGB: #E8EAEC
   * الاستخدام: حدود البطاقات
   * Use: Card borders
   */

  /* ═══════════════════════════════════════════════════════════════
     الشريط الجانبي | Sidebar
     ═══════════════════════════════════════════════════════════════ */
  
  --sidebar: 210 4% 94%;
  /* 
   * RGB: #EFEEF0
   * الاستخدام: خلفية الشريط الجانبي
   * Use: Sidebar background
   */
  
  --sidebar-foreground: 210 15% 15%;
  /* 
   * RGB: #212832
   * الاستخدام: نص الشريط الجانبي
   * Use: Sidebar text
   */
  
  --sidebar-border: 210 8% 90%;
  /* 
   * RGB: #E3E5E8
   * الاستخدام: حدود الشريط الجانبي
   * Use: Sidebar borders
   */
  
  --sidebar-primary: 210 100% 20%;
  /* 
   * RGB: #003366
   * الاستخدام: العناصر المختارة في الشريط الجانبي
   * Use: Active sidebar items
   */
  
  --sidebar-primary-foreground: 0 0% 98%;
  /* 
   * RGB: #FAFAFA
   * الاستخدام: نص العناصر المختارة
   * Use: Active item text
   */
  
  --sidebar-accent: 210 6% 88%;
  /* 
   * RGB: #DDDFE1
   * الاستخدام: تأثير التمرير على عناصر الشريط الجانبي
   * Use: Hover effect on sidebar items
   */
  
  --sidebar-accent-foreground: 210 15% 15%;
  /* 
   * RGB: #212832
   * الاستخدام: نص عناصر التمرير
   * Use: Hover item text
   */
  
  --sidebar-ring: 210 100% 20%;
  /* 
   * RGB: #003366
   * الاستخدام: حلقة التركيز
   * Use: Focus ring
   */

  /* ═══════════════════════════════════════════════════════════════
     القوائم المنبثقة | Popovers
     ═══════════════════════════════════════════════════════════════ */
  
  --popover: 210 6% 92%;
  /* 
   * RGB: #E9EAEC
   * الاستخدام: خلفية القوائم المنبثقة
   * Use: Popover/dropdown background
   */
  
  --popover-foreground: 210 15% 15%;
  /* 
   * RGB: #212832
   * الاستخدام: نص القوائم المنبثقة
   * Use: Popover text
   */
  
  --popover-border: 210 8% 88%;
  /* 
   * RGB: #DDDFE2
   * الاستخدام: حدود القوائم المنبثقة
   * Use: Popover borders
   */

  /* ═══════════════════════════════════════════════════════════════
     الألوان الأساسية | Primary Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --primary: 210 100% 20%;
  /* 
   * RGB: #003366
   * الاستخدام: الأزرار الرئيسية، الروابط، العناصر المهمة
   * Use: Primary buttons, links, important elements
   */
  
  --primary-foreground: 0 0% 98%;
  /* 
   * RGB: #FAFAFA
   * الاستخدام: نص الأزرار الرئيسية
   * Use: Primary button text
   */

  /* ═══════════════════════════════════════════════════════════════
     الألوان الثانوية | Secondary Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --secondary: 210 6% 88%;
  /* 
   * RGB: #DDDFE1
   * الاستخدام: الأزرار الثانوية
   * Use: Secondary buttons
   */
  
  --secondary-foreground: 210 15% 15%;
  /* 
   * RGB: #212832
   * الاستخدام: نص الأزرار الثانوية
   * Use: Secondary button text
   */

  /* ═══════════════════════════════════════════════════════════════
     الألوان الصامتة | Muted Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --muted: 210 6% 90%;
  /* 
   * RGB: #E3E5E7
   * الاستخدام: خلفيات معطلة أو أقل أهمية
   * Use: Disabled or less important backgrounds
   */
  
  --muted-foreground: 210 10% 45%;
  /* 
   * RGB: #676F7D
   * الاستخدام: نص ثانوي، تلميحات، placeholder
   * Use: Secondary text, hints, placeholders
   */

  /* ═══════════════════════════════════════════════════════════════
     ألوان التمييز | Accent Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --accent: 210 8% 92%;
  /* 
   * RGB: #E8EAEC
   * الاستخدام: تأثيرات التمرير، الخلفيات المميزة
   * Use: Hover effects, highlighted backgrounds
   */
  
  --accent-foreground: 210 15% 15%;
  /* 
   * RGB: #212832
   * الاستخدام: نص العناصر المميزة
   * Use: Accent element text
   */

  /* ═══════════════════════════════════════════════════════════════
     ألوان التحذير/الحذف | Destructive Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --destructive: 355 70% 45%;
  /* 
   * RGB: #C4303A
   * الاستخدام: أزرار الحذف، رسائل الخطأ
   * Use: Delete buttons, error messages
   */
  
  --destructive-foreground: 0 0% 98%;
  /* 
   * RGB: #FAFAFA
   * الاستخدام: نص أزرار الحذف
   * Use: Destructive button text
   */

  /* ═══════════════════════════════════════════════════════════════
     عناصر الإدخال | Input Elements
     ═══════════════════════════════════════════════════════════════ */
  
  --input: 210 12% 82%;
  /* 
   * RGB: #CBCFD5
   * الاستخدام: حدود حقول الإدخال
   * Use: Input field borders
   */
  
  --ring: 210 100% 20%;
  /* 
   * RGB: #003366
   * الاستخدام: حلقة التركيز على العناصر
   * Use: Focus ring on elements
   */
  
  --border: 210 8% 88%;
  /* 
   * RGB: #DDDFE2
   * الاستخدام: الحدود العامة
   * Use: General borders
   */

  /* ═══════════════════════════════════════════════════════════════
     ألوان الرسوم البيانية | Chart Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --chart-1: 210 100% 35%;  /* أزرق | Blue #0047AB */
  --chart-2: 140 60% 40%;   /* أخضر | Green #299952 */
  --chart-3: 35 85% 50%;    /* برتقالي | Orange #EB8E0D */
  --chart-4: 280 65% 45%;   /* بنفسجي | Purple #9531BE */
  --chart-5: 25 75% 55%;    /* برتقالي فاتح | Light Orange #DB7B30 */

  /* ═══════════════════════════════════════════════════════════════
     متغيرات تأثير Elevation | Elevation Effect Variables
     ═══════════════════════════════════════════════════════════════ */
  
  --button-outline: rgba(0, 0, 0, 0.10);
  /* الاستخدام: حدود الأزرار الشفافة */
  
  --badge-outline: rgba(0, 0, 0, 0.05);
  /* الاستخدام: حدود الشارات */
  
  --opaque-button-border-intensity: -8;
  /* الاستخدام: شدة حدود الأزرار (بالنسبة المئوية) */
  
  --elevate-1: rgba(0, 0, 0, 0.03);
  /* الاستخدام: تأثير التمرير الخفيف */
  
  --elevate-2: rgba(0, 0, 0, 0.08);
  /* الاستخدام: تأثير الضغط */
}
```

### 🌙 النمط الداكن | Dark Mode

```css
.dark {
  /* ═══════════════════════════════════════════════════════════════
     الخلفيات الأساسية | Primary Backgrounds
     ═══════════════════════════════════════════════════════════════ */
  
  --background: 210 15% 8%;
  /* 
   * RGB: #121619
   * الاستخدام: خلفية الصفحة الرئيسية
   * Use: Main page background
   */
  
  --foreground: 210 5% 95%;
  /* 
   * RGB: #F0F1F2
   * الاستخدام: النص الرئيسي
   * Use: Primary text color
   */

  /* ═══════════════════════════════════════════════════════════════
     البطاقات | Cards
     ═══════════════════════════════════════════════════════════════ */
  
  --card: 210 12% 12%;
  /* 
   * RGB: #1B2026
   * الاستخدام: خلفية البطاقات
   * Use: Card background
   */
  
  --card-foreground: 210 5% 95%;
  /* 
   * RGB: #F0F1F2
   * الاستخدام: نص البطاقات
   * Use: Card text
   */
  
  --card-border: 210 12% 20%;
  /* 
   * RGB: #2D3541
   * الاستخدام: حدود البطاقات
   * Use: Card borders
   */

  /* ═══════════════════════════════════════════════════════════════
     الشريط الجانبي | Sidebar
     ═══════════════════════════════════════════════════════════════ */
  
  --sidebar: 210 12% 10%;
  /* 
   * RGB: #161B20
   * الاستخدام: خلفية الشريط الجانبي
   * Use: Sidebar background
   */
  
  --sidebar-foreground: 210 5% 95%;
  /* 
   * RGB: #F0F1F2
   * الاستخدام: نص الشريط الجانبي
   * Use: Sidebar text
   */
  
  --sidebar-border: 210 12% 16%;
  /* 
   * RGB: #242B34
   * الاستخدام: حدود الشريط الجانبي
   * Use: Sidebar borders
   */
  
  --sidebar-primary: 210 80% 65%;
  /* 
   * RGB: #5CACFF
   * الاستخدام: العناصر المختارة في الشريط الجانبي
   * Use: Active sidebar items
   */
  
  --sidebar-primary-foreground: 210 15% 8%;
  /* 
   * RGB: #121619
   * الاستخدام: نص العناصر المختارة
   * Use: Active item text
   */
  
  --sidebar-accent: 210 12% 18%;
  /* 
   * RGB: #282F38
   * الاستخدام: تأثير التمرير على عناصر الشريط الجانبي
   * Use: Hover effect on sidebar items
   */
  
  --sidebar-accent-foreground: 210 5% 95%;
  /* 
   * RGB: #F0F1F2
   * الاستخدام: نص عناصر التمرير
   * Use: Hover item text
   */
  
  --sidebar-ring: 210 80% 65%;
  /* 
   * RGB: #5CACFF
   * الاستخدام: حلقة التركيز
   * Use: Focus ring
   */

  /* ═══════════════════════════════════════════════════════════════
     القوائم المنبثقة | Popovers
     ═══════════════════════════════════════════════════════════════ */
  
  --popover: 210 12% 15%;
  /* 
   * RGB: #222930
   * الاستخدام: خلفية القوائم المنبثقة
   * Use: Popover/dropdown background
   */
  
  --popover-foreground: 210 5% 95%;
  /* 
   * RGB: #F0F1F2
   * الاستخدام: نص القوائم المنبثقة
   * Use: Popover text
   */
  
  --popover-border: 210 12% 22%;
  /* 
   * RGB: #313A45
   * الاستخدام: حدود القوائم المنبثقة
   * Use: Popover borders
   */

  /* ═══════════════════════════════════════════════════════════════
     الألوان الأساسية | Primary Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --primary: 210 80% 65%;
  /* 
   * RGB: #5CACFF
   * الاستخدام: الأزرار الرئيسية، الروابط، العناصر المهمة
   * Use: Primary buttons, links, important elements
   */
  
  --primary-foreground: 210 15% 8%;
  /* 
   * RGB: #121619
   * الاستخدام: نص الأزرار الرئيسية
   * Use: Primary button text
   */

  /* ═══════════════════════════════════════════════════════════════
     الألوان الثانوية | Secondary Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --secondary: 210 12% 20%;
  /* 
   * RGB: #2D3541
   * الاستخدام: الأزرار الثانوية
   * Use: Secondary buttons
   */
  
  --secondary-foreground: 210 5% 95%;
  /* 
   * RGB: #F0F1F2
   * الاستخدام: نص الأزرار الثانوية
   * Use: Secondary button text
   */

  /* ═══════════════════════════════════════════════════════════════
     الألوان الصامتة | Muted Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --muted: 210 12% 18%;
  /* 
   * RGB: #282F38
   * الاستخدام: خلفيات معطلة أو أقل أهمية
   * Use: Disabled or less important backgrounds
   */
  
  --muted-foreground: 210 8% 75%;
  /* 
   * RGB: #B9BFC6
   * الاستخدام: نص ثانوي، تلميحات، placeholder
   * Use: Secondary text, hints, placeholders
   */

  /* ═══════════════════════════════════════════════════════════════
     ألوان التمييز | Accent Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --accent: 210 12% 16%;
  /* 
   * RGB: #242B34
   * الاستخدام: تأثيرات التمرير، الخلفيات المميزة
   * Use: Hover effects, highlighted backgrounds
   */
  
  --accent-foreground: 210 5% 95%;
  /* 
   * RGB: #F0F1F2
   * الاستخدام: نص العناصر المميزة
   * Use: Accent element text
   */

  /* ═══════════════════════════════════════════════════════════════
     ألوان التحذير/الحذف | Destructive Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --destructive: 355 70% 55%;
  /* 
   * RGB: #E04550
   * الاستخدام: أزرار الحذف، رسائل الخطأ
   * Use: Delete buttons, error messages
   */
  
  --destructive-foreground: 210 15% 8%;
  /* 
   * RGB: #121619
   * الاستخدام: نص أزرار الحذف
   * Use: Destructive button text
   */

  /* ═══════════════════════════════════════════════════════════════
     عناصر الإدخال | Input Elements
     ═══════════════════════════════════════════════════════════════ */
  
  --input: 210 12% 25%;
  /* 
   * RGB: #38414D
   * الاستخدام: حدود حقول الإدخال
   * Use: Input field borders
   */
  
  --ring: 210 80% 65%;
  /* 
   * RGB: #5CACFF
   * الاستخدام: حلقة التركيز على العناصر
   * Use: Focus ring on elements
   */
  
  --border: 210 12% 18%;
  /* 
   * RGB: #282F38
   * الاستخدام: الحدود العامة
   * Use: General borders
   */

  /* ═══════════════════════════════════════════════════════════════
     ألوان الرسوم البيانية | Chart Colors
     ═══════════════════════════════════════════════════════════════ */
  
  --chart-1: 210 80% 70%;   /* أزرق فاتح | Light Blue */
  --chart-2: 140 55% 65%;   /* أخضر فاتح | Light Green */
  --chart-3: 35 75% 65%;    /* برتقالي فاتح | Light Orange */
  --chart-4: 280 60% 70%;   /* بنفسجي فاتح | Light Purple */
  --chart-5: 25 65% 70%;    /* خوخي | Peach */

  /* ═══════════════════════════════════════════════════════════════
     متغيرات تأثير Elevation | Elevation Effect Variables
     ═══════════════════════════════════════════════════════════════ */
  
  --button-outline: rgba(255, 255, 255, 0.10);
  /* الاستخدام: حدود الأزرار الشفافة */
  
  --badge-outline: rgba(255, 255, 255, 0.05);
  /* الاستخدام: حدود الشارات */
  
  --opaque-button-border-intensity: 9;
  /* الاستخدام: شدة حدود الأزرار (بالنسبة المئوية) - إيجابي في الداكن */
  
  --elevate-1: rgba(255, 255, 255, 0.04);
  /* الاستخدام: تأثير التمرير الخفيف */
  
  --elevate-2: rgba(255, 255, 255, 0.09);
  /* الاستخدام: تأثير الضغط */
}
```

---

## 3. الخطوط | Typography

### إعداد الخطوط | Font Setup

```css
/* الخطوط الأساسية */
font-family: "Inter", "Cairo", system-ui, sans-serif;

/* للعربية */
font-family: "Cairo", "Inter", system-ui, sans-serif;

/* للكود */
font-family: "JetBrains Mono", monospace;
```

### أحجام الخطوط | Font Sizes

```css
/* Tailwind CSS Classes */

/* العناوين | Headings */
.text-4xl { font-size: 2.25rem; }    /* 36px - عنوان رئيسي */
.text-3xl { font-size: 1.875rem; }   /* 30px - عنوان ثانوي */
.text-2xl { font-size: 1.5rem; }     /* 24px - عنوان البطاقة */
.text-xl { font-size: 1.25rem; }     /* 20px - عنوان فرعي */
.text-lg { font-size: 1.125rem; }    /* 18px - نص كبير */

/* النصوص | Body Text */
.text-base { font-size: 1rem; }      /* 16px - نص عادي */
.text-sm { font-size: 0.875rem; }    /* 14px - نص صغير */
.text-xs { font-size: 0.75rem; }     /* 12px - تسميات، شارات */

/* أوزان الخطوط | Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### هيكل العناوين | Heading Hierarchy

```jsx
// عنوان الصفحة | Page Title
<h1 className="text-2xl font-semibold leading-none tracking-tight">
  عنوان الصفحة
</h1>

// عنوان البطاقة | Card Title
<h2 className="text-2xl font-semibold leading-none tracking-tight">
  عنوان البطاقة
</h2>

// عنوان فرعي | Section Title
<h3 className="text-xl font-semibold">
  عنوان فرعي
</h3>

// وصف | Description
<p className="text-sm text-muted-foreground">
  نص توضيحي أو وصف
</p>
```

---

## 4. المسافات والأبعاد | Spacing & Sizing

### وحدات المسافات | Spacing Units

```css
/* Tailwind CSS Spacing Scale (--spacing: 0.25rem = 4px) */

.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }   /* 4px */
.p-2 { padding: 0.5rem; }    /* 8px */
.p-3 { padding: 0.75rem; }   /* 12px */
.p-4 { padding: 1rem; }      /* 16px */
.p-5 { padding: 1.25rem; }   /* 20px */
.p-6 { padding: 1.5rem; }    /* 24px */
.p-8 { padding: 2rem; }      /* 32px */
.p-10 { padding: 2.5rem; }   /* 40px */
.p-12 { padding: 3rem; }     /* 48px */
```

### المسافات الموصى بها | Recommended Spacing

| العنصر | المسافة | الكلاس |
|--------|---------|--------|
| داخل البطاقة | 24px | `p-6` |
| بين البطاقات | 16px | `gap-4` |
| داخل الأزرار | 8px 16px | `px-4 py-2` |
| بين عناصر النموذج | 16px | `space-y-4` |
| هامش الصفحة (موبايل) | 16px | `px-4` |
| هامش الصفحة (ديسكتوب) | 24px+ | `px-6` |

---

## 5. الظلال | Shadows

### النمط الفاتح | Light Mode Shadows

```css
:root {
  --shadow-2xs: 0px 2px 0px 0px hsl(210 15% 15% / 0.02);
  --shadow-xs: 0px 2px 0px 0px hsl(210 15% 15% / 0.03);
  --shadow-sm: 0px 2px 0px 0px hsl(210 15% 15% / 0.04), 
               0px 1px 2px -1px hsl(210 15% 15% / 0.05);
  --shadow: 0px 2px 0px 0px hsl(210 15% 15% / 0.05), 
            0px 1px 2px -1px hsl(210 15% 15% / 0.06);
  --shadow-md: 0px 2px 0px 0px hsl(210 15% 15% / 0.06), 
               0px 2px 4px -1px hsl(210 15% 15% / 0.07);
  --shadow-lg: 0px 2px 0px 0px hsl(210 15% 15% / 0.08), 
               0px 4px 6px -1px hsl(210 15% 15% / 0.09);
  --shadow-xl: 0px 2px 0px 0px hsl(210 15% 15% / 0.10), 
               0px 8px 10px -1px hsl(210 15% 15% / 0.11);
  --shadow-2xl: 0px 2px 0px 0px hsl(210 15% 15% / 0.15);
}
```

### النمط الداكن | Dark Mode Shadows

```css
.dark {
  --shadow-2xs: 0px 2px 0px 0px hsl(210 15% 5% / 0.15);
  --shadow-xs: 0px 2px 0px 0px hsl(210 15% 5% / 0.20);
  --shadow-sm: 0px 2px 0px 0px hsl(210 15% 5% / 0.25), 
               0px 1px 2px -1px hsl(210 15% 5% / 0.30);
  --shadow: 0px 2px 0px 0px hsl(210 15% 5% / 0.30), 
            0px 1px 2px -1px hsl(210 15% 5% / 0.35);
  --shadow-md: 0px 2px 0px 0px hsl(210 15% 5% / 0.35), 
               0px 2px 4px -1px hsl(210 15% 5% / 0.40);
  --shadow-lg: 0px 2px 0px 0px hsl(210 15% 5% / 0.40), 
               0px 4px 6px -1px hsl(210 15% 5% / 0.45);
  --shadow-xl: 0px 2px 0px 0px hsl(210 15% 5% / 0.45), 
               0px 8px 10px -1px hsl(210 15% 5% / 0.50);
  --shadow-2xl: 0px 2px 0px 0px hsl(210 15% 5% / 0.60);
}
```

### استخدام الظلال | Shadow Usage

| العنصر | الظل | الكلاس |
|--------|------|--------|
| البطاقات | sm | `shadow-sm` |
| القوائم المنبثقة | md | `shadow-md` |
| النوافذ المنبثقة | lg | `shadow-lg` |
| الأزرار (outline) | xs | `shadow-xs` |

---

## 6. الزوايا | Border Radius

```css
/* المتغيرات */
--radius: 0.5rem;  /* 8px - الافتراضي */

/* Tailwind Classes */
.rounded-sm { border-radius: 0.1875rem; }  /* 3px */
.rounded-md { border-radius: 0.375rem; }   /* 6px */
.rounded-lg { border-radius: 0.5625rem; }  /* 9px */
.rounded-xl { border-radius: 0.75rem; }    /* 12px */
.rounded-2xl { border-radius: 1rem; }      /* 16px */
.rounded-full { border-radius: 9999px; }   /* دائري */
```

### استخدام الزوايا | Radius Usage

| العنصر | الزاوية | الكلاس |
|--------|---------|--------|
| البطاقات | 12px | `rounded-xl` |
| الأزرار | 6px | `rounded-md` |
| حقول الإدخال | 6px | `rounded-md` |
| الشارات | 6px | `rounded-md` |
| الصور الرمزية | full | `rounded-full` |

---

## 7. المكونات | Components

### 7.1 الأزرار | Buttons

```tsx
// أنواع الأزرار | Button Variants

// الزر الرئيسي | Primary Button
<Button variant="default">
  // bg-primary text-primary-foreground border border-primary-border
  // hover-elevate active-elevate-2
</Button>

// الزر الثانوي | Secondary Button
<Button variant="secondary">
  // bg-secondary text-secondary-foreground border border-secondary-border
</Button>

// الزر المحدد | Outline Button
<Button variant="outline">
  // border border-[var(--button-outline)] shadow-xs
</Button>

// الزر الشبحي | Ghost Button
<Button variant="ghost">
  // border border-transparent
</Button>

// زر الحذف | Destructive Button
<Button variant="destructive">
  // bg-destructive text-destructive-foreground border border-destructive-border
</Button>

// أحجام الأزرار | Button Sizes
<Button size="default">  // min-h-9 px-4 py-2
<Button size="sm">       // min-h-8 px-3 text-xs
<Button size="lg">       // min-h-10 px-8
<Button size="icon">     // h-9 w-9
```

### 7.2 البطاقات | Cards

```tsx
<Card>
  // rounded-xl border bg-card border-card-border text-card-foreground shadow-sm
  
  <CardHeader>
    // p-6 space-y-1.5
    <CardTitle>
      // text-2xl font-semibold leading-none tracking-tight
    </CardTitle>
    <CardDescription>
      // text-sm text-muted-foreground
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    // p-6 pt-0
  </CardContent>
  
  <CardFooter>
    // p-6 pt-0 flex items-center
  </CardFooter>
</Card>
```

### 7.3 حقول الإدخال | Inputs

```tsx
<Input>
  // h-9 w-full rounded-md border border-input bg-background
  // px-3 py-2 text-base md:text-sm
  // placeholder:text-muted-foreground
  // focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  // disabled:cursor-not-allowed disabled:opacity-50
</Input>
```

### 7.4 الشارات | Badges

```tsx
// الشارة الافتراضية | Default Badge
<Badge variant="default">
  // bg-primary text-primary-foreground shadow-xs
</Badge>

// الشارة الثانوية | Secondary Badge
<Badge variant="secondary">
  // bg-secondary text-secondary-foreground
</Badge>

// شارة المحدد | Outline Badge
<Badge variant="outline">
  // border border-[var(--badge-outline)] shadow-xs
</Badge>

// شارة الحذف | Destructive Badge
<Badge variant="destructive">
  // bg-destructive text-destructive-foreground shadow-xs
</Badge>

// الخصائص المشتركة | Common Properties
// rounded-md px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap
// hover-elevate
```

---

## 8. التجاوب | Responsive Design

### نقاط التوقف | Breakpoints

```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* موبايل كبير / تابلت صغير */
md: 768px   /* تابلت */
lg: 1024px  /* لابتوب */
xl: 1280px  /* ديسكتوب */
2xl: 1536px /* شاشة كبيرة */
```

### أنماط التجاوب | Responsive Patterns

```css
/* قواعد أساسية للتجاوب */
html, body {
  width: 100%;
  max-width: 100vw;
  overflow-x: clip;
}

/* منع التجاوز */
#root {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

/* الصور والفيديو */
img, video, canvas, iframe {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### تعديلات الموبايل | Mobile Adjustments

```css
/* شاشات صغيرة جداً (< 576px) */
@media (max-width: 575px) {
  h1 { font-size: 1.5rem !important; }    /* 24px */
  h2 { font-size: 1.25rem !important; }   /* 20px */
  h3 { font-size: 1.125rem !important; }  /* 18px */
  
  .p-6 { padding: 1rem !important; }
  .p-8 { padding: 1.5rem !important; }
  .gap-6 { gap: 1rem !important; }
  .gap-8 { gap: 1.5rem !important; }
}

/* شاشات صغيرة (< 640px) */
@media (max-width: 639px) {
  .text-base { font-size: 0.875rem !important; }
  .text-lg { font-size: 1rem !important; }
  .text-xl { font-size: 1.125rem !important; }
}
```

### الشبكة المتجاوبة | Responsive Grid

```css
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### مثال Tailwind للتجاوب

```jsx
// Grid متجاوب
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* العناصر */}
</div>

// Flexbox متجاوب
<div className="flex flex-col md:flex-row gap-4">
  {/* العناصر */}
</div>

// إخفاء/إظهار حسب الشاشة
<div className="hidden md:block">  {/* يظهر فقط على md وأكبر */}
<div className="md:hidden">        {/* يظهر فقط على أصغر من md */}
```

---

## 9. دعم RTL والعربية | RTL & Arabic Support

### إعداد CSS للعربية | Arabic CSS Setup

```css
/* تطبيق خط Cairo للعربية */
html[lang="ar"], 
html[dir="rtl"],
[lang="ar"],
[dir="rtl"] {
  font-family: "Cairo", "Inter", system-ui, sans-serif;
}
```

### تبديل الاتجاه | Direction Toggle

```tsx
// في App.tsx أو Layout
useEffect(() => {
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
}, [language]);
```

### كلاسات RTL المفيدة | Useful RTL Classes

```jsx
// Tailwind RTL utilities
<div className="text-start">      {/* يتبع الاتجاه تلقائياً */}
<div className="text-end">        {/* يتبع الاتجاه تلقائياً */}
<div className="ms-4">            {/* margin-start */}
<div className="me-4">            {/* margin-end */}
<div className="ps-4">            {/* padding-start */}
<div className="pe-4">            {/* padding-end */}
<div className="rtl:flex-row-reverse">  {/* عكس الاتجاه في RTL */}
```

---

## 10. نظام Elevation | Elevation System

نظام ذكي لتغيير سطوع العناصر عند التفاعل (hover/active).

### كيفية الاستخدام | How to Use

```jsx
// تأثير التمرير الخفيف
<button className="hover-elevate">
  // عند التمرير: يضاف --elevate-1 (3% أغمق/أفتح)
</button>

// تأثير التمرير القوي
<button className="hover-elevate-2">
  // عند التمرير: يضاف --elevate-2 (8% أغمق/أفتح)
</button>

// تأثير الضغط
<button className="active-elevate">
  // عند الضغط: يضاف --elevate-1
</button>

// تأثير الضغط القوي
<button className="active-elevate-2">
  // عند الضغط: يضاف --elevate-2
</button>

// الجمع بينهم (مثل الأزرار)
<button className="hover-elevate active-elevate-2">
  // تمرير خفيف + ضغط قوي
</button>

// زر قابل للتبديل
<button className="toggle-elevate toggle-elevated">
  // حالة مفعّلة: يضاف --elevate-2 كخلفية
</button>
```

### إلغاء التأثير | Disable Effect

```jsx
// إلغاء تأثير التمرير
<button className="hover-elevate no-default-hover-elevate">
  // لن يتغير عند التمرير
</button>

// إلغاء تأثير الضغط
<button className="active-elevate no-default-active-elevate">
  // لن يتغير عند الضغط
</button>
```

---

## 📋 ملخص سريع | Quick Reference

### الألوان الأساسية | Main Colors (Light/Dark)

| الاستخدام | النمط الفاتح | النمط الداكن |
|-----------|-------------|--------------|
| خلفية | `#FAFAFA` | `#121619` |
| نص رئيسي | `#212832` | `#F0F1F2` |
| Primary | `#003366` | `#5CACFF` |
| بطاقة | `#F3F4F5` | `#1B2026` |
| حدود | `#DDDFE2` | `#282F38` |
| خطأ | `#C4303A` | `#E04550` |
| نص ثانوي | `#676F7D` | `#B9BFC6` |

### الأحجام الافتراضية | Default Sizes

| العنصر | القيمة |
|--------|--------|
| نصف القطر الافتراضي | 8px |
| ارتفاع الزر | 36px |
| ارتفاع حقل الإدخال | 36px |
| padding البطاقة | 24px |
| حجم الأيقونة | 16px |

### الخطوط | Fonts

| اللغة | الخط |
|-------|------|
| الإنجليزية | Inter |
| العربية | Cairo |
| الكود | JetBrains Mono |

---

## 🚀 كيفية التطبيق على مشروع جديد

### 1. تثبيت الاعتماديات

```bash
npm install tailwindcss postcss autoprefixer
npm install tailwindcss-animate @tailwindcss/typography
npm install class-variance-authority clsx tailwind-merge
```

### 2. نسخ ملفات الإعداد

- انسخ `tailwind.config.ts`
- انسخ متغيرات CSS من `:root` و `.dark`

### 3. إضافة الخطوط

أضف رابط Google Fonts في `index.html`

### 4. إعداد تبديل الوضع الداكن

```tsx
// استخدم class="dark" على html element
document.documentElement.classList.toggle('dark', isDark);
```

### 5. استخدام المكونات

استخدم shadcn/ui أو أنشئ مكوناتك الخاصة باتباع الأنماط الموثقة.

---

**تم إنشاء هذا الملف لتطبيق Log & Ledger Pro**
**Created for Log & Ledger Pro Application**

الإصدار: 1.0
Version: 1.0
التاريخ: 2025

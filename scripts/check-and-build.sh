#!/bin/bash

# Script للتحقق من google-services.json وإعداد APK

echo "🔍 جاري التحقق من google-services.json..."
echo ""

# 1. التحقق من وجود الملف
if [ ! -f "android/app/google-services.json" ]; then
    echo "❌ الملف غير موجود: android/app/google-services.json"
    echo ""
    echo "الحل:"
    echo "1. حمّل google-services.json من Firebase Console"
    echo "2. ضعه في: android/app/"
    exit 1
fi

echo "✅ الملف موجود"
echo ""

# 2. التحقق من محتوى client_id
echo "🔍 جاري فحص OAuth client ID..."
CLIENT_ID=$(grep -o '"client_id": "[^"]*"' android/app/google-services.json | head -1 | cut -d'"' -f4)

if [[ $CLIENT_ID == *"xxxxx"* ]] || [[ $CLIENT_ID == *"XXXXX"* ]]; then
    echo "❌ client_id مزيّف! يحتوي على: xxxxx"
    echo ""
    echo "Client ID الحالي: $CLIENT_ID"
    echo ""
    echo "⚠️ يجب تحميل google-services.json الحقيقي من Firebase Console!"
    echo ""
    echo "الخطوات:"
    echo "1. افتح: https://console.firebase.google.com/project/log-and-ledger/settings/general"
    echo "2. أضف Android app (إذا لم يكن موجود)"
    echo "3. Package name: com.logandledger.app"
    echo "4. SHA-1: 56:6F:90:14:87:45:7B:33:60:FD:28:14:B8:9F:4E:BA:5C:EE:10:78"
    echo "5. حمّل google-services.json"
    echo "6. استبدله في: android/app/google-services.json"
    echo ""
    exit 1
fi

echo "✅ client_id يبدو صحيحاً: ${CLIENT_ID:0:50}..."
echo ""

# 3. التحقق من package_name
PACKAGE_NAME=$(grep -o '"package_name": "[^"]*"' android/app/google-services.json | head -1 | cut -d'"' -f4)

if [ "$PACKAGE_NAME" != "com.logandledger.app" ]; then
    echo "⚠️ package_name غير صحيح!"
    echo "   المتوقع: com.logandledger.app"
    echo "   الموجود: $PACKAGE_NAME"
    echo ""
    echo "قد يسبب مشاكل - تأكد من إضافة التطبيق الصحيح في Firebase!"
    echo ""
else
    echo "✅ package_name صحيح: $PACKAGE_NAME"
    echo ""
fi

# 4. التحقق من project_id
PROJECT_ID=$(grep -o '"project_id": "[^"]*"' android/app/google-services.json | head -1 | cut -d'"' -f4)
echo "✅ project_id: $PROJECT_ID"
echo ""

# 5. عرض ملخص
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ملخص التحقق:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ google-services.json موجود"
echo "✅ client_id حقيقي (ليس xxxxx)"
echo "✅ package_name: $PACKAGE_NAME"
echo "✅ project_id: $PROJECT_ID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 6. سؤال المستخدم
read -p "هل تريد بناء APK الآن؟ (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔨 جاري بناء APK..."
    echo ""
    
    # بناء Frontend
    echo "1️⃣ بناء Frontend..."
    npm run build:frontend
    if [ $? -ne 0 ]; then
        echo "❌ فشل بناء Frontend!"
        exit 1
    fi
    echo ""
    
    # Capacitor sync
    echo "2️⃣ مزامنة Capacitor..."
    npx cap sync android
    if [ $? -ne 0 ]; then
        echo "❌ فشلت مزامنة Capacitor!"
        exit 1
    fi
    echo ""
    
    # بناء APK
    echo "3️⃣ بناء APK..."
    cd android && ./gradlew assembleDebug --warning-mode=none
    if [ $? -ne 0 ]; then
        echo "❌ فشل بناء APK!"
        exit 1
    fi
    cd ..
    echo ""
    
    # عرض معلومات APK
    APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
        APK_DATE=$(ls -lh "$APK_PATH" | awk '{print $6, $7, $8}')
        
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ APK جاهز!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📱 الموقع: $APK_PATH"
        echo "📦 الحجم: $APK_SIZE"
        echo "📅 التاريخ: $APK_DATE"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "🎯 الخطوة التالية:"
        echo "1. انقل APK للموبايل"
        echo "2. ثبّته"
        echo "3. جرّب Google Sign-In"
        echo ""
        echo "يجب أن يعمل الآن بدون أخطاء! ✅"
        echo ""
    else
        echo "❌ لم يتم العثور على APK!"
    fi
else
    echo ""
    echo "تم الإلغاء. يمكنك بناء APK لاحقاً بالأوامر:"
    echo "  npm run build:frontend"
    echo "  npx cap sync android"
    echo "  cd android && ./gradlew assembleDebug"
    echo ""
fi

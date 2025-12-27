#!/bin/bash

echo "🔐 تحديث Google Client IDs"
echo ""
echo "هذا السكريبت سيساعدك على تحديث Client IDs بعد الحصول عليها"
echo ""

# الألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 المعلومات المطلوبة:${NC}"
echo ""

echo "1️⃣  Web Client ID (من Firebase Console)"
echo "   مثال: 808599419586-xxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
read -p "   أدخله هنا: " WEB_CLIENT_ID
echo ""

echo "2️⃣  iOS Client ID (من Google Cloud Console)"
echo "   مثال: 808599419586-yyyyyyyyyyyyyyyy.apps.googleusercontent.com"
read -p "   أدخله هنا: " IOS_CLIENT_ID
echo ""

# التحقق من الإدخال
if [ -z "$WEB_CLIENT_ID" ] || [ -z "$IOS_CLIENT_ID" ]; then
    echo "❌ خطأ: يجب إدخال كلا Client IDs"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ تم استلام Client IDs${NC}"
echo ""
echo "📝 جاري التحديث..."
echo ""

# تحديث firebase.ts
FIREBASE_FILE="client/src/lib/firebase.ts"
if [ -f "$FIREBASE_FILE" ]; then
    # استبدال iOS Client ID
    sed -i.bak "s|clientId: '808599419586-[^']*|clientId: '$IOS_CLIENT_ID|g" "$FIREBASE_FILE"
    echo "✅ تم تحديث $FIREBASE_FILE"
else
    echo "⚠️  تحذير: لم يتم العثور على $FIREBASE_FILE"
fi

# تحديث capacitor.config.ts
CAPACITOR_FILE="capacitor.config.ts"
if [ -f "$CAPACITOR_FILE" ]; then
    # استبدال Web Client ID
    sed -i.bak "s|serverClientId: '808599419586-[^']*|serverClientId: '$WEB_CLIENT_ID|g" "$CAPACITOR_FILE"
    echo "✅ تم تحديث $CAPACITOR_FILE"
else
    echo "⚠️  تحذير: لم يتم العثور على $CAPACITOR_FILE"
fi

echo ""
echo -e "${GREEN}🎉 تم التحديث بنجاح!${NC}"
echo ""
echo "📋 الخطوات التالية:"
echo "1. راجع الملفات للتأكد من التحديث"
echo "2. قم بالبناء: npm run build"
echo "3. قم بالمزامنة: npx cap sync"
echo "4. ابني APK: cd android && ./gradlew assembleDebug"
echo ""

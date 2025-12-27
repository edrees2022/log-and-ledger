#!/bin/bash

echo "📊 حالة الترجمة التلقائية"
echo "======================================"
echo ""

# التحقق من أن العملية تعمل
if pgrep -f "auto-translate-smart.cjs" > /dev/null; then
    echo "✅ السكريبت الذكي يعمل في الخلفية"
else
    echo "❌ السكريبت الذكي متوقف"
fi

echo ""
echo "📝 آخر 15 سطر من السجل:"
echo "--------------------------------------"
tail -15 auto-translation-log.txt
echo ""
echo "======================================"
echo ""
echo "💡 لعرض السجل الكامل:"
echo "   cat auto-translation-log.txt"
echo ""
echo "💡 لإيقاف السكريبت:"
echo "   pkill -f auto-translate-smart.cjs"
echo ""
echo "💡 لإعادة تشغيل السكريبت:"
echo "   nohup node auto-translate-smart.cjs > auto-translation-output.log 2>&1 &"

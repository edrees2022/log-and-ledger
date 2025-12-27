#!/bin/bash

echo "🚀 إعادة تشغيل الترجمة التلقائية"
echo "=================================="
echo ""

# التحقق إذا كان يعمل مسبقاً
if pgrep -f "auto-translate-smart.cjs" > /dev/null; then
    echo "⚠️  السكريبت يعمل بالفعل!"
    echo "💡 لإيقافه: pkill -f auto-translate-smart.cjs"
    exit 1
fi

# بدء الترجمة
echo "✅ بدء الترجمة التلقائية..."
nohup node auto-translate-smart.cjs > auto-translation-output.log 2>&1 &

sleep 2

if pgrep -f "auto-translate-smart.cjs" > /dev/null; then
    echo "✅ السكريبت يعمل الآن في الخلفية!"
    echo ""
    echo "📊 لمراقبة التقدم:"
    echo "   ./check-translation-status.sh"
    echo ""
    echo "📝 للمتابعة المباشرة:"
    echo "   tail -f auto-translation-log.txt"
else
    echo "❌ فشل في تشغيل السكريبت"
    exit 1
fi

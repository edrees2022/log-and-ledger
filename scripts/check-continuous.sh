#!/bin/bash

echo "📊 حالة الترجمة المستمرة"
echo "========================================"
echo ""

# التحقق من أن العملية تعمل
if pgrep -f "translate-continuous.cjs" > /dev/null; then
    PID=$(pgrep -f "translate-continuous.cjs")
    echo "✅ السكريبت المستمر يعمل (PID: $PID)"
    
    # حساب المدة
    START_TIME=$(ps -p $PID -o lstart= 2>/dev/null)
    if [ ! -z "$START_TIME" ]; then
        echo "   بدأ: $START_TIME"
    fi
else
    echo "❌ السكريبت متوقف"
fi

echo ""
echo "📝 آخر 25 سطر من السجل:"
echo "----------------------------------------"
tail -25 continuous-translation-log.txt
echo ""
echo "========================================"
echo ""
echo "💡 للمتابعة المباشرة:"
echo "   tail -f continuous-translation-log.txt"
echo ""
echo "💡 لإيقاف السكريبت:"
echo "   pkill -f translate-continuous.cjs"
echo ""
echo "💡 لفحص أي لغة:"
echo "   node verify-translation.cjs <lang-code>"
echo ""

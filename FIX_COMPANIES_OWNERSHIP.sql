-- إصلاح ربط الشركات - إرجاع الشركات لأصحابها الأصليين

-- أولاً: إزالة firebase_user_id من الشركات التي ليست لك
-- (الشركات التي ليست TibrCode Apps أو admin's Company)

UPDATE companies 
SET firebase_user_id = NULL
WHERE firebase_user_id = '644dbbd3-c481-4797-a230-ea152387a36b'
  AND id NOT IN (
    '8c5f4515-b38c-45e6-8770-e6e2fa3f8763',  -- TibrCode Apps
    '5039579d-9444-49c7-9f1a-26a1ad5b6db0'   -- admin's Company
  );

-- تحقق من النتيجة:
SELECT id, name, firebase_user_id 
FROM companies 
WHERE firebase_user_id = '644dbbd3-c481-4797-a230-ea152387a36b';

-- يجب أن تظهر فقط شركتاك

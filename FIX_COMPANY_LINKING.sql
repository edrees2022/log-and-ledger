-- Run this SQL in your Neon database console to link existing companies to your Firebase user

-- First, check your companies and their firebase_user_id status:
SELECT id, name, firebase_user_id FROM companies;

-- Your Firebase UID from the console is: 644dbbd3-c481-4797-a230-ea152387a36b
-- Your company_id from the console is: 8c5f4515-b38c-45e6-8770-e6e2fa3f8763

-- Run this to link your company to your Firebase account:
UPDATE companies 
SET firebase_user_id = '644dbbd3-c481-4797-a230-ea152387a36b'
WHERE id = '8c5f4515-b38c-45e6-8770-e6e2fa3f8763';

-- Or link ALL unlinked companies to your Firebase user:
UPDATE companies 
SET firebase_user_id = '644dbbd3-c481-4797-a230-ea152387a36b'
WHERE firebase_user_id IS NULL;

-- Verify the change:
SELECT id, name, firebase_user_id FROM companies;

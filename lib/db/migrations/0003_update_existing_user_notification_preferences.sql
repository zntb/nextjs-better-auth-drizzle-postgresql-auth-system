-- Update existing users to have notification preferences enabled by default
-- This ensures existing users match the UI default state
UPDATE "user" 
SET 
  "email_notifications_enabled" = COALESCE("email_notifications_enabled", true),
  "security_alerts_enabled" = COALESCE("security_alerts_enabled", true)
WHERE "email_notifications_enabled" IS NULL 
   OR "security_alerts_enabled" IS NULL;
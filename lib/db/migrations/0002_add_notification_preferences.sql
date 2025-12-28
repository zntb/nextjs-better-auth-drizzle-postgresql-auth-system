-- Add notification preferences to user table (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'email_notifications_enabled'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "email_notifications_enabled" boolean NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'security_alerts_enabled'
    ) THEN
        ALTER TABLE "user" ADD COLUMN "security_alerts_enabled" boolean NOT NULL DEFAULT true;
    END IF;
END $$;
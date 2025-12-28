ALTER TABLE "user" ADD COLUMN "default_login_method" text DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_notifications_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "security_alerts_enabled" boolean DEFAULT true NOT NULL;
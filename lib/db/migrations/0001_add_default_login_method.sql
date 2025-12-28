-- Add defaultLoginMethod column to user table
ALTER TABLE "user" ADD COLUMN "default_login_method" text DEFAULT 'email' NOT NULL;
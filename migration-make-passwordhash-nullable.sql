-- Migration to make passwordHash nullable in users table
-- This allows creating user accounts for invitation-based registration
-- where users will set their password later via email invitation

ALTER TABLE users 
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- Add a comment to explain the nullable field
COMMENT ON COLUMN users."passwordHash" IS 'Password hash - can be null for invitation-based users until they set their password';
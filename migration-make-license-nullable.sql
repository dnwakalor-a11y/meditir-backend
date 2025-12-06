-- Migration to make licenseNumber nullable in providers table
-- This allows creating basic provider profiles that can be completed later

ALTER TABLE providers ALTER COLUMN "licenseNumber" DROP NOT NULL;

-- Also remove the unique constraint if it exists to prevent conflicts
-- when multiple providers might have null license numbers initially
ALTER TABLE providers
DROP CONSTRAINT IF EXISTS "UQ_providers_licenseNumber";

-- Add a partial unique index that only applies to non-null values
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_providers_licenseNumber_unique" ON providers ("licenseNumber")
WHERE
    "licenseNumber" IS NOT NULL;
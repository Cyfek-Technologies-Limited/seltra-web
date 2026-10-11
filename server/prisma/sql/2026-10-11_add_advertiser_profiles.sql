-- Additive only: creates the advertiser_profiles table used by POST /api/v1/advertiser/onboarding.
-- Safe to run more than once. Does not modify any existing table or row.

CREATE TABLE IF NOT EXISTS "advertiser_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "targetAudience" TEXT[],
    "audienceNotes" TEXT,
    "campaignGoal" TEXT NOT NULL,
    "monthlyBudget" TEXT NOT NULL,
    "targetLocations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "advertiser_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "advertiser_profiles_userId_key"
    ON "advertiser_profiles"("userId");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'advertiser_profiles_userId_fkey'
    ) THEN
        ALTER TABLE "advertiser_profiles"
            ADD CONSTRAINT "advertiser_profiles_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

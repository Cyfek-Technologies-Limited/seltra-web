-- Apply this migration before deploying the social proof integration.
CREATE TABLE "PublisherSocialConnection" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "username" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PublisherSocialConnection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PublisherSocialConnection_publisherId_provider_key" ON "PublisherSocialConnection"("publisherId", "provider");
CREATE UNIQUE INDEX "PublisherSocialConnection_provider_accountId_key" ON "PublisherSocialConnection"("provider", "accountId");
ALTER TABLE "PublisherSocialConnection" ADD CONSTRAINT "PublisherSocialConnection_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublisherEarning" ADD COLUMN "platformEvidence" JSONB;

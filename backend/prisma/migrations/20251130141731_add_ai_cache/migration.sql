-- CreateTable
CREATE TABLE "AIRecommendationCache" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "dataHash" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIRecommendationCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIRecommendationCache_userId_dataHash_idx" ON "AIRecommendationCache"("userId", "dataHash");

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAICache() {
    try {
        console.log('🧹 Clearing AI recommendation cache...');

        const result = await prisma.aIRecommendationCache.deleteMany({});
        console.log(`✅ Deleted ${result.count} cached recommendations`);

        console.log('🎉 Cache cleared! Dashboard will generate new AI insights.');
    } catch (error) {
        console.error('❌ Error clearing cache:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearAICache();

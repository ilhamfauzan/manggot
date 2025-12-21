import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  try {
    console.log('🧹 Clearing all data except users...');

    // Delete in order of dependencies
    await prisma.prediksiPanen.deleteMany({});
    console.log('✅ Deleted all PrediksiPanen');

    await prisma.fase.deleteMany({});
    console.log('✅ Deleted all Fase');

    await prisma.siklus.deleteMany({});
    console.log('✅ Deleted all Siklus');

    await prisma.pencacahan.deleteMany({});
    console.log('✅ Deleted all Pencacahan');

    await prisma.notifikasi.deleteMany({});
    console.log('✅ Deleted all Notifikasi');

    console.log('');
    console.log('🎉 All data cleared successfully!');
    console.log('👤 Users preserved');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearData();

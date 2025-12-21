import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://maggot_production_user:TRvdOrRZu29qAzYJNBfSD87fBl48Cb9q@dpg-d546edchg0os7399qtug-a.oregon-postgres.render.com/maggot_production'
    }
  }
});

async function main() {
  console.log('Starting to seed dummy data...\n');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  console.log('Creating users...');
  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'admin_rw4' },
      update: {},
      create: { username: 'admin_rw4', password: hashedPassword, rw: 'RW4' }
    }),
    prisma.user.upsert({
      where: { username: 'admin_rw5' },
      update: {},
      create: { username: 'admin_rw5', password: hashedPassword, rw: 'RW5' }
    }),
    prisma.user.upsert({
      where: { username: 'user1_rw4' },
      update: {},
      create: { username: 'user1_rw4', password: hashedPassword, rw: 'RW4' }
    }),
    prisma.user.upsert({
      where: { username: 'user2_rw5' },
      update: {},
      create: { username: 'user2_rw5', password: hashedPassword, rw: 'RW5' }
    }),
    prisma.user.upsert({
      where: { username: 'peternak1' },
      update: {},
      create: { username: 'peternak1', password: hashedPassword, rw: 'RW4' }
    })
  ]);
  console.log(`Created ${users.length} users\n`);

  // 2. Create Siklus for each user
  console.log('Creating siklus...');
  const siklusData = [];
  for (const user of users) {
    // Each user gets 2-3 siklus
    const numSiklus = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numSiklus; i++) {
      const siklus = await prisma.siklus.create({
        data: {
          tanggalMulai: new Date(Date.now() - (i * 30 + Math.random() * 10) * 24 * 60 * 60 * 1000),
          jumlahTelur: Math.floor(Math.random() * 5000) + 1000,
          mediaTelur: ['Dedak', 'Ampas Tahu', 'Limbah Sayuran', 'Campuran Organik'][Math.floor(Math.random() * 4)],
          catatan: `Siklus budidaya maggot ke-${i + 1} untuk ${user.username}`,
          userId: user.id
        }
      });
      siklusData.push(siklus);
    }
  }
  console.log(`Created ${siklusData.length} siklus\n`);

  // 3. Create Fase for each Siklus
  console.log('Creating fase...');
  const faseData = [];
  for (const siklus of siklusData) {
    // Create PENETASAN fase
    const fasePenetasan = await prisma.fase.create({
      data: {
        jenis: 'PENETASAN',
        tanggal: new Date(siklus.tanggalMulai.getTime() + 2 * 24 * 60 * 60 * 1000),
        jumlahTelur: siklus.jumlahTelur,
        keterangan: 'Telur mulai menetas dengan baik',
        siklusId: siklus.id
      }
    });
    faseData.push(fasePenetasan);

    // Create PEMBESARAN fase
    const fasePembesaran = await prisma.fase.create({
      data: {
        jenis: 'PEMBESARAN',
        tanggal: new Date(siklus.tanggalMulai.getTime() + 7 * 24 * 60 * 60 * 1000),
        jumlahMakanan: Math.random() * 50 + 20,
        keterangan: 'Larva berkembang dengan baik, pemberian pakan teratur',
        siklusId: siklus.id
      }
    });
    faseData.push(fasePembesaran);

    // Create PANEN fase (only for some siklus - completed ones)
    if (Math.random() > 0.3) {
      const fasePanen = await prisma.fase.create({
        data: {
          jenis: 'PANEN',
          tanggal: new Date(siklus.tanggalMulai.getTime() + 14 * 24 * 60 * 60 * 1000),
          keterangan: 'Panen berhasil, kualitas larva bagus',
          siklusId: siklus.id
        }
      });
      faseData.push(fasePanen);

      // 4. Create PrediksiPanen for PANEN fase
      const hasilGram = Math.random() * 2000 + 500;
      await prisma.prediksiPanen.create({
        data: {
          hasilGram: hasilGram,
          hasilKg: hasilGram / 1000,
          conversionRate: Math.random() * 0.3 + 0.15,
          conversionLabel: ['Sangat Baik', 'Baik', 'Cukup'][Math.floor(Math.random() * 3)],
          roiEstimate: Math.random() * 50 + 20,
          estimatedValue: hasilGram * 25,
          feedCost: Math.random() * 50000 + 20000,
          faseId: fasePanen.id
        }
      });
    }
  }
  console.log(`Created ${faseData.length} fase\n`);

  // 5. Create Pencacahan data
  console.log('Creating pencacahan...');
  const pencacahanData = [];
  for (const user of users) {
    const numRecords = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numRecords; i++) {
      const record = await prisma.pencacahan.create({
        data: {
          tanggalWaktu: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
          totalSampah: Math.random() * 100 + 10,
          catatan: `Pencacahan sampah organik minggu ke-${i + 1}`,
          userId: user.id
        }
      });
      pencacahanData.push(record);
    }
  }
  console.log(`Created ${pencacahanData.length} pencacahan records\n`);

  // 6. Create Notifikasi
  console.log('Creating notifikasi...');
  const notifikasiTypes = ['info', 'warning', 'success'];
  const notifikasiMessages = [
    { title: 'Siklus Baru', message: 'Siklus budidaya baru telah dimulai', type: 'info' },
    { title: 'Waktunya Panen!', message: 'Maggot sudah siap dipanen, segera lakukan panen', type: 'success' },
    { title: 'Peringatan Suhu', message: 'Suhu media terlalu tinggi, perlu perhatian', type: 'warning' },
    { title: 'Pemberian Pakan', message: 'Waktunya memberikan pakan tambahan', type: 'info' },
    { title: 'Hasil Prediksi', message: 'Prediksi panen telah selesai dihitung', type: 'success' }
  ];

  const notifikasiData = [];
  for (const user of users) {
    for (const notif of notifikasiMessages) {
      const record = await prisma.notifikasi.create({
        data: {
          userId: user.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          isRead: Math.random() > 0.5
        }
      });
      notifikasiData.push(record);
    }
  }
  console.log(`Created ${notifikasiData.length} notifikasi\n`);

  console.log('='.repeat(50));
  console.log('SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(50));
  console.log(`Summary:`);
  console.log(`- Users: ${users.length}`);
  console.log(`- Siklus: ${siklusData.length}`);
  console.log(`- Fase: ${faseData.length}`);
  console.log(`- Pencacahan: ${pencacahanData.length}`);
  console.log(`- Notifikasi: ${notifikasiData.length}`);
  console.log('\nAll users have password: password123');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

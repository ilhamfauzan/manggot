import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // 1. Create Users
  const password = await bcrypt.hash('123456', 10);
  
  const user1 = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: password,
      rw: 'RW4',
    },
  });
  console.log(`✅ User created: ${user1.username} (password: 123456)`);

  const user2 = await prisma.user.upsert({
    where: { username: 'petani_rw4' },
    update: {},
    create: {
      username: 'petani_rw4',
      password: password,
      rw: 'RW4',
    },
  });
  console.log(`✅ User created: ${user2.username} (password: 123456)`);

  const user3 = await prisma.user.upsert({
    where: { username: 'petani_rw5' },
    update: {},
    create: {
      username: 'petani_rw5',
      password: password,
      rw: 'RW5',
    },
  });
  console.log(`✅ User created: ${user3.username} (password: 123456)`);

  const users = [user1, user2, user3];
  const user = user1; // Keep compatibility with rest of script



  // 3. Create Cycles (Siklus) & Phases (Fase)
  console.log('Creating cycles and phases...');
  
  // 3. Create Cycles (Siklus) & Phases (Fase)
  console.log('Creating cycles and phases...');

  // Clear existing cycles to avoid duplicates/zigzag from multiple runs
  // Must delete in order of dependency: PrediksiPanen -> Fase -> Siklus
  await prisma.prediksiPanen.deleteMany({});
  await prisma.fase.deleteMany({});
  await prisma.siklus.deleteMany({});
  await prisma.pencacahan.deleteMany({}); // Also clear waste data to avoid duplicates
  console.log('🧹 Cleared old cycle and waste data.');

  const cycles = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 100); // Start 100 days ago

  for (let i = 1; i <= 10; i++) {
    // Create a realistic trend: Base 15kg + (CycleNum * 0.5) + Random(-2 to +3)
    // This creates a general upward trend with some noise
    const baseYield = 15 + (i * 0.8); 
    const noise = (Math.random() * 5) - 2; // -2 to +3
    const finalYield = parseFloat((baseYield + noise).toFixed(1));
    
    // Dates
    const cycleStart = new Date(startDate);
    cycleStart.setDate(startDate.getDate() + ((i-1) * 10)); // New cycle every 10 days
    
    const harvestDate = new Date(cycleStart);
    harvestDate.setDate(cycleStart.getDate() + 14); // 14 days cycle

    cycles.push({
      userId: user.id,
      tanggalMulai: cycleStart,
      jumlahTelur: 10 + i, // Increasing scale
      mediaTelur: 'Campuran Organik',
      catatan: `Siklus Produksi ${i}`,
      fase: {
        create: [
          { jenis: 'PENETASAN', tanggal: cycleStart, jumlahTelur: 10 + i },
          { jenis: 'PEMBESARAN', tanggal: new Date(cycleStart.getTime() + 3*24*60*60*1000), jumlahMakanan: 50 + (i*2) },
          { 
            jenis: 'PANEN', 
            tanggal: harvestDate, 
            keterangan: 'Panen rutin',
            prediksiPanen: {
              create: {
                hasilGram: finalYield * 1000,
                hasilKg: finalYield,
                conversionRate: 15 + (Math.random() * 5),
                conversionLabel: finalYield > 20 ? 'Sangat Baik' : 'Baik',
                roiEstimate: 20 + (Math.random() * 10),
                estimatedValue: finalYield * 10000,
                feedCost: 50000 + (i * 1000)
              }
            }
          }
        ]
      }
    });
  }

  for (const cycleData of cycles) {
    await prisma.siklus.create({ data: cycleData });
  }

  // Create one active cycle (no harvest yet)
  await prisma.siklus.create({
    data: {
      userId: user.id,
      tanggalMulai: new Date(),
      jumlahTelur: 25,
      mediaTelur: 'Limbah Pasar',
      catatan: 'Siklus Aktif Saat Ini',
      fase: {
        create: [
          { jenis: 'PENETASAN', tanggal: new Date(), jumlahTelur: 25 },
          { jenis: 'PEMBESARAN', tanggal: new Date(), jumlahMakanan: 80 }
        ]
      }
    }
  });

  console.log('✅ Cycles created.');

  // 4. Create Waste Data (Pencacahan) - 30 days history
  console.log('Creating waste data history...');
  const wasteData = [];
  const wasteStartDate = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(wasteStartDate);
    date.setDate(wasteStartDate.getDate() - i);
    
    // Random waste between 10-50 kg with some variance
    const amount = 10 + Math.floor(Math.random() * 40);
    
    wasteData.push({
      userId: user.id,
      tanggalWaktu: date,
      totalSampah: amount,
      catatan: `Setoran sampah harian`,
    });
  }
  await prisma.pencacahan.createMany({ data: wasteData });
  console.log('✅ Waste data history created (30 days).');

  // 5. Create Notifications for all users
  console.log('Creating notifications...');
  await prisma.notifikasi.deleteMany({}); // Clear old notifications
  
  const notificationTypes = ['info', 'warning', 'success'];
  const notificationTemplates = [
    { title: 'Selamat Datang!', message: 'Selamat datang di aplikasi Maggot BEM. Mulai kelola budidaya maggot Anda sekarang!', type: 'info' },
    { title: 'Siklus Baru Dimulai', message: 'Siklus penetasan baru telah dimulai. Pantau perkembangan telur Anda.', type: 'success' },
    { title: 'Pengingat Pemberian Pakan', message: 'Jangan lupa untuk memberikan pakan pada larva maggot hari ini.', type: 'warning' },
    { title: 'Panen Berhasil', message: 'Selamat! Panen siklus terakhir berhasil dengan hasil 22.5 kg.', type: 'success' },
    { title: 'Tips Budidaya', message: 'Suhu ideal untuk penetasan telur maggot adalah 27-30°C.', type: 'info' },
    { title: 'Perhatian Kelembaban', message: 'Kelembaban media terlalu rendah. Segera tambahkan air untuk hasil optimal.', type: 'warning' },
    { title: 'Target Tercapai', message: 'Anda telah mencapai target produksi bulan ini. Luar biasa!', type: 'success' },
    { title: 'Update Harga Pasar', message: 'Harga maggot segar saat ini Rp 15.000/kg di pasar lokal.', type: 'info' },
  ];

  const notifications = [];
  for (const u of users) {
    for (let i = 0; i < notificationTemplates.length; i++) {
      const template = notificationTemplates[i];
      const date = new Date();
      date.setDate(date.getDate() - i); // Different dates
      
      notifications.push({
        userId: u.id,
        title: template.title,
        message: template.message,
        type: template.type,
        isRead: i > 3, // First 4 notifications are unread
        createdAt: date,
      });
    }
  }
  await prisma.notifikasi.createMany({ data: notifications });
  console.log(`✅ Notifications created (${notifications.length} total).`);

  console.log('🌱 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

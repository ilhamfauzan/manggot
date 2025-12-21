import prisma from "../lib/prisma.js";
import axios from "axios";
import { createNotifikasi } from "./notifikasiController.js";

function parseRupiah(str) {
  if (!str) return 0;
  return Number(str.replace(/[^0-9]/g, ""));
}

export const tambahFase = async (req, res) => {
  try {
    const userId = req.user.id;
    const siklusId = Number(req.params.siklusId);
    const { jenis, tanggal, jumlahTelur, jumlahMakanan, keterangan } = req.body;

    const siklus = await prisma.siklus.findFirst({ where: { id: siklusId, userId } });
    if (!siklus) return res.status(404).json({ message: "Siklus tidak ditemukan" });

    const fase = await prisma.fase.create({
      data: {
        jenis,
        tanggal: new Date(tanggal),
        jumlahTelur: jumlahTelur || null,
        jumlahMakanan: jumlahMakanan || null,
        keterangan: keterangan || null,
        siklusId
      }
    });

    // === NOTIF FASE APAPUN ===
    await createNotifikasi(
      userId,
      `Fase ${jenis} Ditambahkan`,
      `Fase ${jenis} berhasil ditambahkan ke siklus ${siklusId}.`,
      "info"
    );

    // Jika bukan PANEN → return langsung
    if (jenis !== "PANEN") {
      return res.json({ success: true, data: fase });
    }

    // === LOGIC PREDIKSI PANEN ===
    console.log(`📊 Fase PANEN created, generating prediction...`);

    // ✅ FIX: Ambil jumlahTelur dari siklus
    const jumlahTelurSiklus = siklus.jumlahTelur;
    
    // ✅ FIX: Ambil jumlahMakanan dari fase PEMBESARAN
    const fasePembesaran = await prisma.fase.findFirst({
      where: { 
        siklusId,
        jenis: "PEMBESARAN"
      },
      orderBy: { createdAt: 'desc' }  // Ambil yang terbaru
    });

    if (!fasePembesaran || !fasePembesaran.jumlahMakanan) {
      console.error("❌ Fase PEMBESARAN not found or no jumlahMakanan");
      return res.status(400).json({ 
        success: false,
        message: "Fase PEMBESARAN harus ada terlebih dahulu dengan data jumlah makanan" 
      });
    }

    const jumlahMakananPembesaran = fasePembesaran.jumlahMakanan;
    
    console.log(`✅ Data untuk ML:`);
    console.log(`   jumlahTelur: ${jumlahTelurSiklus}g (dari siklus)`);
    console.log(`   jumlahMakanan: ${jumlahMakananPembesaran}g (dari fase PEMBESARAN)`);

    // Request ML prediction
    const ML_API_URL = process.env.FLASK_ML_URL || "http://localhost:5000";
    
    try {
      console.log(`🔮 Calling ML API: ${ML_API_URL}/api/predict/panen`);
      
      const ml = await axios.post(`${ML_API_URL}/api/predict/panen`, {
        jumlah_telur_gram: Number(jumlahTelurSiklus),
        makanan_gram: Number(jumlahMakananPembesaran)
      });

      console.log(`✅ ML API Response:`, ml.data);

      // Cek response structure
      if (!ml.data || !ml.data.prediction) {
        throw new Error("Invalid ML API response structure");
      }

      const prediction = ml.data.prediction;
      const business = ml.data.business_metrics;

      const prediksiPanen = await prisma.prediksiPanen.create({
        data: {
          hasilGram: prediction.jumlah_panen_gram,
          hasilKg: prediction.jumlah_panen_kg,
          conversionRate: prediction.conversion_rate,
          conversionLabel: prediction.conversion_label,
          roiEstimate: business.roi_estimate,
          estimatedValue: parseRupiah(business.estimated_value),
          feedCost: parseRupiah(business.feed_cost),
          faseId: fase.id
        }
      });

      console.log(`✅ Prediksi saved to DB: ID ${prediksiPanen.id}`);

      // === NOTIFIKASI PREDIKSI BERHASIL ===
      await createNotifikasi(
        userId,
        "Prediksi Panen Berhasil",
        `Prediksi panen untuk siklus ${siklusId} berhasil dibuat.`,
        "success"
      );

      res.json({ success: true, data: { fase, prediksiPanen } });
    } catch (mlError) {
      console.error("❌ ML API Error:", mlError.response?.data || mlError.message);
      
      // Notifikasi error
      await createNotifikasi(
        userId,
        "Gagal Membuat Prediksi",
        `Error: ${mlError.response?.data?.error || mlError.message}`,
        "error"
      );
      
      return res.status(500).json({ 
        success: false, 
        message: "Gagal membuat prediksi panen", 
        error: mlError.response?.data?.error || mlError.message 
      });
    }
  } catch (err) {
    console.error("tambahFase:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getFase = async (req, res) => {
  try {
    const userId = req.user.id;
    const siklusId = Number(req.params.siklusId);

    const siklus = await prisma.siklus.findFirst({ where: { id: siklusId, userId } });
    if (!siklus) return res.status(404).json({ message: "Siklus tidak ditemukan" });

    const fase = await prisma.fase.findMany({
      where: { siklusId },
      include: { prediksiPanen: true }
    });

    res.json({ success: true, data: fase });
  } catch (err) {
    console.error("getFase:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const timeRange = req.query.timeRange || 'all'; // 7d, 30d, 90d, all

    // Calculate date filter based on timeRange
    let dateFilter = {};
    const now = new Date();

    if (timeRange === '7d') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      dateFilter = { gte: sevenDaysAgo };
    } else if (timeRange === '30d') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      dateFilter = { gte: thirtyDaysAgo };
    } else if (timeRange === '90d') {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      dateFilter = { gte: ninetyDaysAgo };
    }
    // 'all' means no date filter

    // 1. Aggregation Logic with date filtering

    // A. Yield & Efficiency (Filter by Harvest Date)
    const harvestFases = await prisma.fase.findMany({
      where: {
        jenis: 'PANEN',
        createdAt: dateFilter, // Filter by when the harvest happened
        siklus: { userId: userId }
      },
      include: { prediksiPanen: true, siklus: true }
    });

    let totalYield = 0;
    let totalConversionRate = 0;
    let conversionCount = 0;
    const chartData = [];

    harvestFases.forEach(fase => {
      if (fase.prediksiPanen) {
        totalYield += fase.prediksiPanen.hasilKg;
        totalConversionRate += fase.prediksiPanen.conversionRate;
        conversionCount++;
        chartData.push({
          label: `S${fase.siklus.id}`, // Use Cycle ID as label
          value: fase.prediksiPanen.hasilKg,
          date: fase.createdAt
        });
      }
    });

    const avgConversionRate = conversionCount > 0 ? (totalConversionRate / conversionCount) : 0;

    // C. Efficiency Chart Data (Feed vs Yield per Cycle)
    // We need to fetch the 'PEMBESARAN' phase for each harvested cycle to get 'jumlahMakanan'
    const efficiencyChart = await Promise.all(harvestFases.map(async (fase) => {
      const pembesaran = await prisma.fase.findFirst({
        where: {
          siklusId: fase.siklusId,
          jenis: 'PEMBESARAN'
        }
      });

      return {
        label: `S${fase.siklus.id}`,
        yield: fase.prediksiPanen ? fase.prediksiPanen.hasilKg : 0,
        feed: pembesaran ? (pembesaran.jumlahMakanan || 0) : 0,
        ratio: fase.prediksiPanen ? fase.prediksiPanen.conversionRate : 0
      };
    }));
    const activeCyclesCount = await prisma.siklus.count({
      where: {
        userId: userId,
        fase: {
          none: { jenis: 'PANEN' } // No harvest yet
        }
      }
    });
    const activeCycles = activeCyclesCount;

    // Count completed cycles (cycles that have PANEN phase)
    const completedCycles = harvestFases.length;

    // Calculate total feed input from all PEMBESARAN phases
    let totalFeedInput = 0;
    for (const item of efficiencyChart) {
      totalFeedInput += item.feed;
    }

    const wasteData = await prisma.pencacahan.aggregate({
      where: {
        userId: userId,
        ...(dateFilter.gte && { tanggalWaktu: dateFilter })
      },
      _sum: { totalSampah: true }
    });
    const totalWaste = wasteData._sum.totalSampah || 0;

    const recentWaste = await prisma.pencacahan.findMany({
      where: {
        userId: userId,
        ...(dateFilter.gte && { tanggalWaktu: dateFilter })
      },
      orderBy: { createdAt: 'desc' },
      take: 7
    });
    const wasteChartData = recentWaste.map(w => ({
      label: w.createdAt.toISOString().split('T')[0],
      value: w.totalSampah
    })).reverse();

    // 2. AI recommendation - DISABLED CACHE, always generate fresh
    let aiRecommendation = "Memuat saran...";

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Data: Panen ${totalYield.toFixed(1)}kg, Sampah ${totalWaste.toFixed(1)}kg.

Buat 3 baris saran PENDEK:
📊 [hasil panen, sebutkan angka]
⚠️ [1 masalah ATAU "Tidak ada masalah"]
👉 [1 saran konkret]

Maks 8 kata per baris. Bahasa sederhana.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let rawText = response.text();

        // Clean markdown formatting
        aiRecommendation = rawText
          .replace(/\*\*/g, '')  // Remove bold
          .replace(/\*/g, '')    // Remove italic
          .replace(/#/g, '')     // Remove headers
          .trim();

        // No caching - always fresh recommendations

      } catch (aiError) {
        console.error("Gemini Error:", aiError);
        aiRecommendation = "Sistem AI sedang sibuk, namun data Anda aman.";
      }
    }

    res.json({
      totalYield,
      totalWaste,
      totalFeedInput,
      activeCycles,
      completedCycles,
      yieldChart: chartData.slice(-7),
      wasteChart: wasteChartData,
      efficiencyChart: efficiencyChart,
      aiRecommendation,
      timeRange: timeRange
    });

  } catch (error) {
    console.error("Error getting dashboard summary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

    // avgConversionRate is already calculated above

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

    // 2. Check for cached AI recommendation (with time range in hash)
    const dataHash = `${totalYield}-${totalWaste}-${avgConversionRate}-${activeCycles}-${timeRange}`;
    let cachedRecommendation = await prisma.aIRecommendationCache.findFirst({
      where: { 
        userId: userId,
        dataHash: dataHash
      }
    });

    let aiRecommendation = "Data tidak cukup untuk analisis.";
    
    if (cachedRecommendation) {
      // Use cached recommendation
      aiRecommendation = cachedRecommendation.recommendation;
      console.log("Using cached AI recommendation");
    } else if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const timeContext = timeRange === 'all' ? 'sepanjang waktu' : 
                               timeRange === '7d' ? '7 hari terakhir' :
                               timeRange === '30d' ? '30 hari terakhir' : '90 hari terakhir';

            const prompt = `
              Analisis data budidaya maggot berikut (periode: ${timeContext}):
              - Total Panen: ${totalYield.toFixed(2)} kg
              - Total Sampah Diolah: ${totalWaste.toFixed(2)} kg
              - Rata-rata Efisiensi Konversi: ${avgConversionRate.toFixed(2)}%
              - Siklus Aktif: ${activeCycles}

              Berikan ringkasan eksekutif dalam 3-4 kalimat. Fokus pada:
              1. Evaluasi kinerja operasional periode ini
              2. Insight penting dari angka efisiensi
              3. Satu rekomendasi konkret untuk peningkatan bisnis
              
              Gunakan bahasa Indonesia profesional tapi tidak terlalu formal. 
              JANGAN gunakan format markdown, sapaan formal (Bapak/Ibu/Manajer), atau istilah asing (BSF).
              Langsung to the point.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let rawText = response.text();
            
            // Clean markdown formatting
            aiRecommendation = rawText
              .replace(/\*\*/g, '')  // Remove bold
              .replace(/\*/g, '')    // Remove italic
              .replace(/#/g, '')     // Remove headers
              .trim();

            // Cache the recommendation
            try {
              await prisma.aIRecommendationCache.create({
                data: {
                  userId: userId,
                  dataHash: dataHash,
                  recommendation: aiRecommendation
                }
              });
              console.log("AI recommendation cached successfully");
            } catch (cacheError) {
              console.error("Failed to cache AI recommendation:", cacheError);
              // Don't fail the request if caching fails
            }
            
        } catch (aiError) {
            console.error("Gemini Error:", aiError);
            aiRecommendation = "Sistem AI sedang sibuk, namun data Anda aman.";
        }
    }

    res.json({
      totalYield,
      totalWaste,
      activeCycles,
      avgConversionRate,
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

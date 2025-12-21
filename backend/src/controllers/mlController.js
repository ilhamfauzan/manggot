import axios from "axios";

const FLASK_ML_URL = process.env.FLASK_ML_URL || "http://localhost:5000";

// ======================================================
// POST: Prediksi Penetasan (Hatching Time)
// ======================================================
export const predictPenetasan = async (req, res) => {
  try {
    const {
      jumlah_telur_gram,
      media_telur,
      temp,
      humidity,
      temp_max,
      weather_main,
      season
    } = req.body;

    // Validasi input
    if (!jumlah_telur_gram || !media_telur || !temp || !humidity || !temp_max || !weather_main || !season) {
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi"
      });
    }

    // Call Flask ML API
    const mlResponse = await axios.post(
      `${FLASK_ML_URL}/api/predict/penetasan`,
      {
        jumlah_telur_gram: Number(jumlah_telur_gram),
        media_telur,
        temp: Number(temp),
        humidity: Number(humidity),
        temp_max: Number(temp_max),
        weather_main,
        season
      }
    );

    return res.json({
      success: true,
      data: mlResponse.data
    });

  } catch (err) {
    console.error("predictPenetasan error:", err.response?.data || err.message);
    
    // Handle Flask API errors
    if (err.response) {
      return res.status(err.response.status).json({
        success: false,
        message: err.response.data.error || "Terjadi kesalahan pada prediksi ML",
        details: err.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// ======================================================
// POST: Prediksi Panen (Harvest Yield)
// ======================================================
export const predictPanen = async (req, res) => {
  try {
    const { jumlah_telur_gram, makanan_gram } = req.body;

    // Validasi input
    if (!jumlah_telur_gram || !makanan_gram) {
      return res.status(400).json({
        success: false,
        message: "jumlah_telur_gram dan makanan_gram wajib diisi"
      });
    }

    // Call Flask ML API
    const mlResponse = await axios.post(
      `${FLASK_ML_URL}/api/predict/panen`,
      {
        jumlah_telur_gram: Number(jumlah_telur_gram),
        makanan_gram: Number(makanan_gram)
      }
    );

    return res.json({
      success: true,
      data: mlResponse.data
    });

  } catch (err) {
    console.error("predictPanen error:", err.response?.data || err.message);
    
    // Handle Flask API errors
    if (err.response) {
      return res.status(err.response.status).json({
        success: false,
        message: err.response.data.error || "Terjadi kesalahan pada prediksi ML",
        details: err.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// ======================================================
// GET: Flask ML API Health Check
// ======================================================
export const checkMLHealth = async (req, res) => {
  try {
    const mlResponse = await axios.get(`${FLASK_ML_URL}/api/health`);
    
    return res.json({
      success: true,
      flask_status: mlResponse.data
    });

  } catch (err) {
    console.error("checkMLHealth error:", err.message);
    
    return res.status(503).json({
      success: false,
      message: "Flask ML API tidak tersedia"
    });
  }
};


// ======================================================
// GET: Model Information
// ======================================================
export const getModelInfo = async (req, res) => {
  try {
    const mlResponse = await axios.get(`${FLASK_ML_URL}/api/info`);
    
    return res.json({
      success: true,
      data: mlResponse.data
    });

  } catch (err) {
    console.error("getModelInfo error:", err.message);
    
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil informasi model"
    });
  }
};

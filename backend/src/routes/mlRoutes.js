import express from "express";
import { 
  predictPenetasan, 
  predictPanen,
  checkMLHealth,
  getModelInfo
} from "../controllers/mlController.js";
import { authMiddleware } from "../authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ML Prediction
 *   description: API untuk prediksi ML (penetasan & panen) menggunakan model lokal
 */

/**
 * @swagger
 * /api/ml/health:
 *   get:
 *     summary: Check Flask ML API health
 *     tags: [ML Prediction]
 *     responses:
 *       200:
 *         description: ML API is healthy
 */
router.get("/health", checkMLHealth);

/**
 * @swagger
 * /api/ml/info:
 *   get:
 *     summary: Get model information
 *     tags: [ML Prediction]
 *     responses:
 *       200:
 *         description: Model information retrieved
 */
router.get("/info", getModelInfo);

/**
 * @swagger
 * /api/ml/predict/penetasan:
 *   post:
 *     summary: Prediksi lama penetasan maggot (hatching time)
 *     tags: [ML Prediction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jumlah_telur_gram
 *               - media_telur
 *               - temp
 *               - humidity
 *               - temp_max
 *               - weather_main
 *               - season
 *             properties:
 *               jumlah_telur_gram:
 *                 type: number
 *                 example: 100
 *               media_telur:
 *                 type: string
 *                 example: "Dedak atau Bekatul"
 *               temp:
 *                 type: number
 *                 example: 29
 *               humidity:
 *                 type: number
 *                 example: 75
 *               temp_max:
 *                 type: number
 *                 example: 31
 *               weather_main:
 *                 type: string
 *                 example: "Clear"
 *               season:
 *                 type: string
 *                 example: "Kemarau"
 *     responses:
 *       200:
 *         description: Prediction successful
 */
router.post("/predict/penetasan", authMiddleware, predictPenetasan);

/**
 * @swagger
 * /api/ml/predict/panen:
 *   post:
 *     summary: Prediksi hasil panen maggot (harvest yield)
 *     tags: [ML Prediction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jumlah_telur_gram
 *               - makanan_gram
 *             properties:
 *               jumlah_telur_gram:
 *                 type: number
 *                 example: 100
 *               makanan_gram:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Prediction successful
 */
router.post("/predict/panen", authMiddleware, predictPanen);

export default router;

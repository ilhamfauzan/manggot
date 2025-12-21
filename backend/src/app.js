import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerUiServe, swaggerUiSetup } from "./swagger.js";
import authRoutes from "./routes/authRoutes.js";
import prediksiRoutes from "./routes/prediksiRoutes.js";
import pencacahanRoutes from "./routes/pencacahanRoutes.js";
import siklusRoutes from "./routes/siklusRoutes.js";
import faseRoutes from "./routes/faseRoutes.js";
import { authMiddleware } from "./authMiddleware.js";
import notifikasiRoutes from "./routes/notifikasiRoutes.js";
import mlRoutes from "./routes/mlRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/prediksi", prediksiRoutes);
app.use("/api/pencacahan", pencacahanRoutes);
app.use("/api/siklus", authMiddleware, siklusRoutes);
app.use("/api/siklus", authMiddleware, faseRoutes);
app.use("/api/notifikasi", authMiddleware, notifikasiRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api-docs", swaggerUiServe, swaggerUiSetup);

// Health check endpoint for Render
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "maggot-api",
    timestamp: new Date().toISOString()
  });
});

export default app;
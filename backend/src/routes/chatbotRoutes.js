import express from "express";
import { chatWithGemini } from "../controllers/chatbotController.js";
import { authMiddleware } from "../authMiddleware.js";

const router = express.Router();

// Route: POST /api/chatbot/chat
// Protected by authMiddleware to ensure only logged-in users can chat
router.post("/chat", authMiddleware, chatWithGemini);

export default router;

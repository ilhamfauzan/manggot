import express from 'express';
import { getDashboardSummary } from '../controllers/DashboardController.js';
import { authMiddleware } from '../authMiddleware.js';

const router = express.Router();

router.get('/summary', authMiddleware, getDashboardSummary);

export default router;

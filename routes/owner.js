import express from 'express';
import { getOwnerDashboard } from '../controllers/ownerController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole(['owner']),
  getOwnerDashboard
);

export default router;

import express from 'express';
import { getStoresForUsers, addStore } from '../controllers/storeController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import {submitRating} from "../controllers/ratingController.js";
const router = express.Router();

// Get stores (for logged-in users)
router.get('/', authenticateToken, getStoresForUsers);

// Add new store (only admin or owner)
router.post('/', authenticateToken, authorizeRole(['admin', 'owner']), addStore);
router.post('/:storeId/rate', authenticateToken, submitRating);

export default router;

import express from 'express';
import { submitRating, getUserRatings } from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, submitRating);
router.get('/user', authenticateToken, getUserRatings);

export default router;

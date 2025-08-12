import express from 'express';
import { body } from 'express-validator';
import { updatePassword } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.patch(
  '/password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 16 })
      .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
      .matches(/[^A-Za-z0-9]/).withMessage('New password must contain at least one special character'),
  ],
  updatePassword
);

export default router;

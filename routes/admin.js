import express from 'express';
import { body } from 'express-validator';
import { addStore, addUser } from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/adminController.js';
import { getUsers } from '../controllers/adminController.js';
import { getStores } from '../controllers/adminController.js';
import { getUserDetails } from '../controllers/adminController.js';

const router = express.Router();

router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole(['admin']),
  getDashboardStats
);

// POST /admin/stores - Add a new store (admin only)
router.post(
  '/stores',
  authenticateToken,
  authorizeRole(['admin']),
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('address').isLength({ max: 400 }).withMessage('Address too long'),
    body('owner_id').isInt().withMessage('Valid owner_id is required'),
  ],
  addStore
);

router.get(
  '/users',
  authenticateToken,
  authorizeRole(['admin']),
  getUsers
);

router.get(
  '/stores',
  authenticateToken,
  authorizeRole(['admin','user']),
  getStores
); 

router.get(
  '/users/:id',
  authenticateToken,
  authorizeRole(['admin']),
  getUserDetails
);


router.post(
  '/users',
  authenticateToken,
  authorizeRole(['admin']),
  [
    body('name').isLength({ min: 2, max: 60 }),
    body('email').isEmail(),
    body('password')
      .isLength({ min: 8, max: 16 })
      .matches(/[A-Z]/)
      .matches(/[^A-Za-z0-9]/),
    body('address').isLength({ max: 400 }),
    body('role').isIn(['admin', 'owner', 'user']),
  ],
  addUser
);

export default router;

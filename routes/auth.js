import express from 'express';
import { body } from 'express-validator';
import { signupUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

/**
 * @route POST /auth/signup
 * @desc Register a new user
 */
router.post(
  '/signup',
  [
    body('name')
      .isLength({ min: 20, max: 60 })
      .withMessage('Name must be between 20 and 60 characters'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 8, max: 16 })
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[^A-Za-z0-9]/)
      .withMessage('Password must contain at least one special character'),
    body('address').isLength({ max: 400 }).withMessage('Address too long'),
    body('role')
      .isIn(['admin', 'owner', 'user'])
      .withMessage('Role must be admin, owner, or user'),
  ],
  signupUser
);

/**
 * @route POST /auth/login
 * @desc Login an existing user
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);

export default router;

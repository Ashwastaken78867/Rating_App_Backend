import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/auth.js'; // Import auth routes
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js';
import storeRoutes from './routes/store.js';
import ratingRoutes from './routes/rating.js';
import ownerRoutes from './routes/owner.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route to check DB connection
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Use auth routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/stores', storeRoutes);
app.use('/ratings', ratingRoutes);
app.use('/owner', ownerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

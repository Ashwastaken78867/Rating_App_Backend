import pool from '../db.js';

export const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const store_id = parseInt(req.params.storeId);
    const rating_value = req.body.rating;

    if (!Number.isInteger(rating_value) || rating_value < 1 || rating_value > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }



    // Check if store exists
    const storeCheck = await pool.query('SELECT * FROM stores WHERE id = $1', [store_id]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await pool.query(
      'SELECT * FROM ratings WHERE store_id = $1 AND user_id = $2',
      [store_id, userId]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating_value = $1 WHERE store_id = $2 AND user_id = $3',
        [rating_value, store_id, userId]
      );
    } else {
      // Insert new rating
      await pool.query(
        'INSERT INTO ratings (store_id, user_id, rating_value) VALUES ($1, $2, $3)',
        [store_id, userId, rating_value]
      );
    }

    // Update avg_rating in stores table
    const avgResult = await pool.query(
      `SELECT AVG(rating_value)::numeric(2,1) as avg_rating FROM ratings WHERE store_id = $1`,
      [store_id]
    );

    const avgRating = avgResult.rows[0].avg_rating || 0;

    await pool.query(
      'UPDATE stores SET avg_rating = $1 WHERE id = $2',
      [avgRating, store_id]
    );

    res.json({ message: 'Rating submitted successfully', avg_rating: avgRating });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT r.id, r.rating_value, s.id AS store_id, s.name AS store_name, s.address, s.avg_rating
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = $1`,
      [userId]
    );

    res.json({ ratings: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user ratings' });
  }
};


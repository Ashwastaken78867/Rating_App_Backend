import pool from '../db.js';

export const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get all stores owned by this user
    const storesResult = await pool.query(
      'SELECT id, name, address, avg_rating FROM stores WHERE owner_id = $1',
      [ownerId]
    );

    const stores = storesResult.rows;

    // For each store, get users who rated it with their ratings
    const storeRatingsPromises = stores.map(async (store) => {
      const ratingsResult = await pool.query(
        `SELECT u.id AS user_id, u.name AS user_name, u.email AS user_email, r.rating_value
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1`,
        [store.id]
      );

      return {
        ...store,
        ratings: ratingsResult.rows,
      };
    });

    const storesWithRatings = await Promise.all(storeRatingsPromises);

    res.json({ stores: storesWithRatings });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching owner dashboard' });
  }
};

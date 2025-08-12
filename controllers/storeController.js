import pool from '../db.js';

export const getStoresForUsers = async (req, res) => {
  try {
    const { name, address, sort = 'id', order = 'asc' } = req.query;
    const userId = req.user.id; // logged-in user

    const allowedSortFields = ['id', 'name', 'email', 'address', 'average_rating'];
    const allowedOrder = ['asc', 'desc'];

    const sortField = allowedSortFields.includes(sort.toLowerCase()) ? sort : 'id';
    const sortOrder = allowedOrder.includes(order.toLowerCase()) ? order : 'asc';

    const filters = [];
    const values = [];

    if (name) {
      values.push(`%${name}%`);
      filters.push(`s.name ILIKE $${values.length}`);
    }
    if (address) {
      values.push(`%${address}%`);
      filters.push(`s.address ILIKE $${values.length}`);
    }

    values.push(userId); // for the user_rating join

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT 
        s.id,
        s.name,
        s.address,
        COALESCE(AVG(all_ratings.rating_value), 0) AS average_rating,
        ur.rating_value AS user_rating
      FROM stores s
      LEFT JOIN ratings all_ratings 
        ON s.id = all_ratings.store_id
      LEFT JOIN ratings ur 
        ON s.id = ur.store_id AND ur.user_id = $${values.length}
      ${whereClause}
      GROUP BY s.id, ur.rating_value
      ORDER BY ${sortField} ${sortOrder}
      LIMIT 100
    `;

    const result = await pool.query(query, values);

    res.json({ stores: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching stores' });
  }
};


export const addStore = async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  try {
    // Simple validation (you can enhance this)
    if (!name || !email || !owner_id) {
      return res.status(400).json({ message: 'Name, email, and owner_id are required' });
    }

    // Insert new store
    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, address, owner_id, avg_rating`,
      [name, email, address, owner_id]
    );

    res.status(201).json({ message: 'Store added successfully', store: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding store' });
  }
};


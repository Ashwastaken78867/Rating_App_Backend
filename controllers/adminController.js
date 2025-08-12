import pool from '../db.js';
import { validationResult } from 'express-validator';

export const addStore = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, address, owner_id } = req.body;

  try {
    // Insert new store
    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, address, owner_id]
    );

    res.status(201).json({
      message: 'Store added successfully',
      store: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding store' });
  }
};
//Add controller function to fetch stores with filtering and sorting

export const getStores = async (req, res) => {
  try {
    const { name, address, sort = 'id', order = 'asc' } = req.query;

    // Allowed columns for sorting
    const allowedSortFields = ['id', 'name', 'email', 'address', 'avg_rating'];
    const allowedOrder = ['asc', 'desc'];

    // Validate sort and order
    const sortField = allowedSortFields.includes(sort.toLowerCase()) ? sort : 'id';
    const sortOrder = allowedOrder.includes(order.toLowerCase()) ? order : 'asc';

    // Build filters dynamically
    const filters = [];
    const values = [];

    if (name) {
      values.push(`%${name}%`);
      filters.push(`name ILIKE $${values.length}`);
    }
    if (address) {
      values.push(`%${address}%`);
      filters.push(`address ILIKE $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Final query with filtering and sorting
    const query = `
      SELECT id, name, email, address, avg_rating
      FROM stores
      ${whereClause}
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


export const getDashboardStats = async (req, res) => {
  try {
    // Query total users
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    // Query total stores
    const storesResult = await pool.query('SELECT COUNT(*) FROM stores');
    // Query total ratings
    const ratingsResult = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count, 10),
      totalStores: parseInt(storesResult.rows[0].count, 10),
      totalRatings: parseInt(ratingsResult.rows[0].count, 10),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};


//Add controller function to fetch users with filters and sorting  

export const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sort = 'id', order = 'asc' } = req.query;

    // Allowed columns for sorting to prevent SQL injection
    const allowedSortFields = ['id', 'name', 'email', 'address', 'role'];
    const allowedOrder = ['asc', 'desc'];

    // Validate sort and order
    const sortField = allowedSortFields.includes(sort.toLowerCase()) ? sort : 'id';
    const sortOrder = allowedOrder.includes(order.toLowerCase()) ? order : 'asc';

    // Build filters dynamically
    const filters = [];
    const values = [];

    if (name) {
      values.push(`%${name}%`);
      filters.push(`name ILIKE $${values.length}`);
    }
    if (email) {
      values.push(`%${email}%`);
      filters.push(`email ILIKE $${values.length}`);
    }
    if (address) {
      values.push(`%${address}%`);
      filters.push(`address ILIKE $${values.length}`);
    }
    if (role) {
      values.push(role);
      filters.push(`role = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // Final query with filtering and sorting
    const query = `
      SELECT id, name, email, address, role
      FROM users
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT 100
    `;

    const result = await pool.query(query, values);

    res.json({ users: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};
//Add controller function to get user details with store rating if owner
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user details
    const userResult = await pool.query(
      `SELECT id, name, email, address, role FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // If user is store owner, fetch avg rating of their store(s)
    if (user.role === 'owner') {
      const ratingResult = await pool.query(
        `SELECT AVG(avg_rating) as avg_rating
         FROM stores WHERE owner_id = $1`,
         [userId]
      );

      user.avg_rating = ratingResult.rows[0].avg_rating || 0;
    }

    res.json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
};



import bcrypt from 'bcrypt';

export const addUser = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, address, role } = req.body;

  try {
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User added successfully',
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding user' });
  }
};

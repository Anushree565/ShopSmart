const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const user = { id: result.insertId, name, email };
    const token = signToken(user);

    res.status(201).json({ success: true, message: 'Registration successful', token, user });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const dbUser = rows[0];
    const match = await bcrypt.compare(password, dbUser.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
    const token = signToken(user);

    res.json({ success: true, message: 'Login successful', token, user });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
}

module.exports = { register, login };

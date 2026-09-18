const pool = require('../config/db');

// GET /api/categories
async function getCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getCategories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
}

// GET /api/categories/:id/subcategories
async function getSubcategories(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT s.*,
        (SELECT COUNT(*) FROM products p WHERE p.subcategory_id = s.id) AS product_count
       FROM subcategories s
       WHERE s.category_id = ?
       ORDER BY s.id ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getSubcategories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch subcategories' });
  }
}

module.exports = { getCategories, getSubcategories };

const pool = require('../config/db');

// GET /api/wishlist
async function getWishlist(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT p.* FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getWishlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
}

// POST /api/wishlist  { productId }
async function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const [product] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    if (existing.length) {
      return res.status(200).json({ success: true, message: 'Already in wishlist' });
    }

    await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
    res.status(201).json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    console.error('addToWishlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
}

// DELETE /api/wishlist/:productId
async function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    await pool.query('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    console.error('removeFromWishlist error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };

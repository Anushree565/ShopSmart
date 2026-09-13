const pool = require('../config/db');

// GET /api/products
// Supports: category, subcategory, search, minPrice, maxPrice, rating, inStock, sort, page, limit
async function getProducts(req, res) {
  try {
    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      rating,
      inStock,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const where = [];
    const params = [];

    if (category) {
      where.push('p.category_id = ?');
      params.push(category);
    }
    if (subcategory) {
      where.push('p.subcategory_id = ?');
      params.push(subcategory);
    }
    if (search) {
      where.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (minPrice) {
      where.push('p.price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      where.push('p.price <= ?');
      params.push(Number(maxPrice));
    }
    if (rating) {
      where.push('p.rating >= ?');
      params.push(Number(rating));
    }
    if (inStock === 'true') {
      where.push('p.stock > 0');
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    let orderClause = 'ORDER BY p.featured DESC, p.id DESC';
    switch (sort) {
      case 'price_low':
        orderClause = 'ORDER BY p.price ASC';
        break;
      case 'price_high':
        orderClause = 'ORDER BY p.price DESC';
        break;
      case 'rating':
        orderClause = 'ORDER BY p.rating DESC';
        break;
      case 'newest':
        orderClause = 'ORDER BY p.created_at DESC';
        break;
      default:
        orderClause = 'ORDER BY p.featured DESC, p.id DESC';
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const countSql = `SELECT COUNT(*) AS total FROM products p ${whereClause}`;
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT p.*, c.name AS category_name, s.name AS subcategory_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN subcategories s ON p.subcategory_id = s.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataSql, [...params, limitNum, offset]);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, s.name AS subcategory_name
       FROM products p
       JOIN categories c ON p.category_id = c.id
       JOIN subcategories s ON p.subcategory_id = s.id
       WHERE p.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = rows[0];

    const [related] = await pool.query(
      `SELECT * FROM products WHERE subcategory_id = ? AND id != ? ORDER BY RAND() LIMIT 8`,
      [product.subcategory_id, product.id]
    );

    res.json({ success: true, data: product, related });
  } catch (err) {
    console.error('getProductById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
}

module.exports = { getProducts, getProductById };

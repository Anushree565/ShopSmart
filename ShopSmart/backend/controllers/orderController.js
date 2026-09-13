const pool = require('../config/db');

// POST /api/orders
async function createOrder(req, res) {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { fullName, email, phone, address, city, state, pincode, paymentMethod, items } = req.body;

    if (!fullName || !email || !phone || !address || !city || !state || !pincode) {
      conn.release();
      return res.status(400).json({ success: false, message: 'All shipping details are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      conn.release();
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    if (!['COD', 'UPI', 'CARD'].includes(paymentMethod)) {
      conn.release();
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    await conn.beginTransaction();

    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      const [rows] = await conn.query('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (!rows.length) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
      }
      const product = rows[0];
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      total += Number(product.price) * qty;
      validatedItems.push({ productId: product.id, name: product.name, price: product.price, quantity: qty });
    }

    const deliveryFee = total >= 500 ? 0 : 49;
    const grandTotal = total + deliveryFee;

    const [orderResult] = await conn.query(
      `INSERT INTO orders
        (user_id, full_name, email, phone, address, city, state, pincode, payment_method, subtotal, delivery_fee, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [userId, fullName, email, phone, address, city, state, pincode, paymentMethod, total, deliveryFee, grandTotal]
    );

    const orderId = orderResult.insertId;

    for (const item of validatedItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name, item.price, item.quantity]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { orderId, total: grandTotal }
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
}

// GET /api/orders
async function getOrders(req, res) {
  try {
    const userId = req.user.id;
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      order.items = items;
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
}

module.exports = { createOrder, getOrders };

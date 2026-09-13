const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getOrders);

module.exports = router;

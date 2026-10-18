const express = require('express');
const { protect, managerOnly } = require('../middleware/auth');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

const router = express.Router();
router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, managerOnly, getAllOrders);
router.patch('/:id/status', protect, updateOrderStatus);

module.exports = router;

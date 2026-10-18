const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Table = require('../models/Table');

const PROMOS = { WELCOME10: 10, FEAST20: 20 };
const validId = (id) => /^[a-f\d]{24}$/i.test(id) && mongoose.Types.ObjectId.isValid(id);

async function createOrder(req, res) {
  try {
    const { items, type, table: tableId, pickupTime, promoCode = '' } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Order must include at least one item' });
    if (!['Dine-in', 'Takeaway'].includes(type)) return res.status(400).json({ message: 'Type must be Dine-in or Takeaway' });
    if (type === 'Dine-in' && (!tableId || !validId(tableId))) return res.status(400).json({ message: 'A valid table is required for dine-in' });
    if (type === 'Takeaway' && !pickupTime) return res.status(400).json({ message: 'Pickup time is required for takeaway' });

    const normalizedItems = [];
    let subtotal = 0;
    for (const requested of items) {
      if (!requested.menuItem || !validId(requested.menuItem) || !Number.isInteger(requested.quantity) || requested.quantity < 1) {
        return res.status(400).json({ message: 'Each item needs a valid menuItem id and quantity of at least 1' });
      }
      const menuItem = await MenuItem.findById(requested.menuItem);
      if (!menuItem) return res.status(400).json({ message: 'Order contains an unknown menu item' });
      if (!menuItem.isAvailable) return res.status(400).json({ message: `${menuItem.name} is unavailable` });
      // Read each current database price so a client cannot change the charged total.
      subtotal += menuItem.price * requested.quantity;
      normalizedItems.push({ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: requested.quantity, note: requested.note || '' });
    }
    let table;
    if (type === 'Dine-in') {
      table = await Table.findById(tableId);
      if (!table) return res.status(400).json({ message: 'Table not found' });
    }
    const cleanPromo = String(promoCode).trim().toUpperCase();
    const discountPercent = PROMOS[cleanPromo] || 0;
    if (cleanPromo && !discountPercent) return res.status(400).json({ message: 'Invalid promo code' });
    const serviceCharge = subtotal * 0.05;
    const salesTax = subtotal * 0.15;
    const discount = subtotal * (discountPercent / 100);
    const total = Number((subtotal + serviceCharge + salesTax - discount).toFixed(2));
    const order = await Order.create({
      user: req.user._id, items: normalizedItems, promoCode: discountPercent ? cleanPromo : '',
      discountPercent, total, type, ...(table ? { table: table._id } : {}), ...(type === 'Takeaway' ? { pickupTime } : {}),
    });
    return res.status(201).json(order);
  } catch (error) { return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message }); }
}

async function getMyOrders(req, res) {
  try { return res.status(200).json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
}

async function getAllOrders(req, res) {
  try { return res.status(200).json(await Order.find().populate('user', 'name email').populate('table', 'number seats').sort({ createdAt: -1 })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
}

async function updateOrderStatus(req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const nextStatus = req.body.status;
    if (req.user.role !== 'manager') {
      if (String(order.user) !== String(req.user._id) || nextStatus !== 'Cancelled' || order.status !== 'Pending') {
        return res.status(403).json({ message: 'You may only cancel your own pending order' });
      }
    } else {
      const steps = ['Pending', 'Preparing', 'Ready', 'Served'];
      const currentIndex = steps.indexOf(order.status);
      const nextIndex = steps.indexOf(nextStatus);
      const canAdvance = currentIndex >= 0 && nextIndex === currentIndex + 1;
      const canCancel = order.status === 'Pending' && nextStatus === 'Cancelled';
      if (!canAdvance && !canCancel) return res.status(400).json({ message: 'Status can only move forward; only pending orders can be cancelled' });
    }
    order.status = nextStatus;
    await order.save();
    return res.status(200).json(order);
  } catch (error) { return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message }); }
}

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus };

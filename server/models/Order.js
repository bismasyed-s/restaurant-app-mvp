const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  }],
  promoCode: { type: String, default: '' },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  total: { type: Number, required: true, min: 0 },
  type: { type: String, required: true, enum: ['Dine-in', 'Takeaway'] },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  pickupTime: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

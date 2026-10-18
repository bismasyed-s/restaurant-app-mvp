const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['Starters', 'Mains', 'Desserts', 'Drinks'] },
  image: { type: String, default: '' },
  isSpecial: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

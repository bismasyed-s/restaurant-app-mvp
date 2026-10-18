const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  seats: { type: Number, required: true, min: 1 },
});

module.exports = mongoose.model('Table', tableSchema);

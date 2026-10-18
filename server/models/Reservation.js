const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true, enum: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
  partySize: { type: Number, required: true, min: 1, max: 12 },
  phone: { type: String, required: true, match: /^03\d{2}-\d{7}$/ },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);

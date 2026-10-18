const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

const timeSlots = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const validId = (id) => /^[a-f\d]{24}$/i.test(id) && mongoose.Types.ObjectId.isValid(id);
const dayBounds = (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { $gte: start, $lt: end };
};

async function findAvailableTables(date, timeSlot, partySize) {
  const reservations = await Reservation.find({ date: dayBounds(date), timeSlot, status: { $in: ['Pending', 'Accepted'] } }).select('table');
  const busyIds = reservations.map((reservation) => reservation.table);
  return Table.find({ seats: { $gte: partySize }, _id: { $nin: busyIds } }).sort({ number: 1 });
}

async function createReservation(req, res) {
  try {
    const { table: tableId, date, timeSlot, partySize, phone } = req.body;
    if (!tableId || !validId(tableId) || !date || !timeSlot || partySize === undefined || !phone) return res.status(400).json({ message: 'Table, date, timeSlot, partySize, and phone are required' });
    const dateValue = new Date(date);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (Number.isNaN(dateValue.getTime()) || dateValue < today) return res.status(400).json({ message: 'Date cannot be in the past' });
    if (!timeSlots.includes(timeSlot)) return res.status(400).json({ message: 'Time slot must be between 12:00 and 22:00' });
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 12) return res.status(400).json({ message: 'Party size must be between 1 and 12' });
    if (!/^03\d{2}-\d{7}$/.test(phone)) return res.status(400).json({ message: 'Phone must match 03XX-XXXXXXX' });
    const table = await Table.findById(tableId);
    if (!table) return res.status(400).json({ message: 'Table not found' });
    if (table.seats < partySize) return res.status(400).json({ message: 'Table does not have enough seats' });
    const occupied = await Reservation.findOne({ table: tableId, date: dayBounds(dateValue), timeSlot, status: { $in: ['Pending', 'Accepted'] } });
    if (occupied) return res.status(409).json({ message: 'This table is already booked for that date and time' });
    const reservation = await Reservation.create({ user: req.user._id, table: tableId, date: dateValue, timeSlot, partySize, phone });
    return res.status(201).json(reservation);
  } catch (error) { return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message }); }
}

async function getMyReservations(req, res) {
  try { return res.status(200).json(await Reservation.find({ user: req.user._id }).populate('table', 'number seats').sort({ date: 1, timeSlot: 1 })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
}

async function getAllReservations(req, res) {
  try { return res.status(200).json(await Reservation.find().populate('user', 'name email').populate('table', 'number seats').sort({ date: 1, timeSlot: 1 })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
}

async function updateReservation(req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid reservation id' });
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    const { status } = req.body;
    if (req.user.role === 'manager') {
      if (!['Accepted', 'Declined'].includes(status)) return res.status(400).json({ message: 'Manager may accept or decline a reservation' });
      if (reservation.status !== 'Pending') return res.status(400).json({ message: 'Only pending reservations can be accepted or declined' });
    } else {
      if (String(reservation.user) !== String(req.user._id) || status !== 'Cancelled') return res.status(403).json({ message: 'You may only cancel your own reservation' });
      if (!['Pending', 'Accepted'].includes(reservation.status)) return res.status(400).json({ message: 'This reservation cannot be cancelled' });
    }
    reservation.status = status;
    await reservation.save();
    return res.status(200).json(reservation);
  } catch (error) { return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message }); }
}

async function getAvailability(req, res) {
  try {
    const { date, timeSlot, partySize } = req.query;
    const dateValue = new Date(date);
    const size = Number(partySize);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (!date || Number.isNaN(dateValue.getTime()) || dateValue < today) return res.status(400).json({ message: 'A valid current or future date is required' });
    if (!timeSlots.includes(timeSlot)) return res.status(400).json({ message: 'A valid timeSlot between 12:00 and 22:00 is required' });
    if (!Number.isInteger(size) || size < 1 || size > 12) return res.status(400).json({ message: 'partySize must be between 1 and 12' });
    return res.status(200).json(await findAvailableTables(dateValue, timeSlot, size));
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

async function getTables(req, res) {
  try { return res.status(200).json(await Table.find().sort({ number: 1 })); }
  catch (error) { return res.status(500).json({ message: error.message }); }
}

module.exports = { createReservation, getMyReservations, getAllReservations, updateReservation, getAvailability, getTables };

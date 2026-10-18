const express = require('express');
const { protect, managerOnly } = require('../middleware/auth');
const {
  createReservation, getMyReservations, getAllReservations,
  updateReservation, getAvailability,
} = require('../controllers/reservationController');

const router = express.Router();
router.get('/availability', protect, getAvailability);
router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/', protect, managerOnly, getAllReservations);
router.patch('/:id', protect, updateReservation);

module.exports = router;

const express = require('express');
const { protect } = require('../middleware/auth');
const { getTables } = require('../controllers/reservationController');

const router = express.Router();
router.get('/', protect, getTables);
module.exports = router;

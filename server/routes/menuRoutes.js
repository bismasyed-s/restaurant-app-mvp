const express = require('express');
const { protect, managerOnly } = require('../middleware/auth');
const { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');

const router = express.Router();

router.get('/', getMenu);
router.get('/:id', getMenuItem);
router.post('/', protect, managerOnly, createMenuItem);
router.put('/:id', protect, managerOnly, updateMenuItem);
router.delete('/:id', protect, managerOnly, deleteMenuItem);

module.exports = router;

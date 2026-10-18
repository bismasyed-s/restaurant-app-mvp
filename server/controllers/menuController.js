const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

const categories = ['Starters', 'Mains', 'Desserts', 'Drinks'];
const validId = (id) => /^[a-f\d]{24}$/i.test(id) && mongoose.Types.ObjectId.isValid(id);

async function getMenu(req, res) {
  try {
    const filter = {};
    if (req.query.category) {
      if (!categories.includes(req.query.category)) return res.status(400).json({ message: 'Invalid category' });
      filter.category = req.query.category;
    }
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
    const items = await MenuItem.find(filter).sort({ name: 1 });
    return res.status(200).json(items);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

async function getMenuItem(req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid menu item id' });
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.status(200).json(item);
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

async function createMenuItem(req, res) {
  try {
    const { name, price, category } = req.body;
    if (!name || price === undefined || !category) return res.status(400).json({ message: 'Name, price, and category are required' });
    if (typeof price !== 'number' || price < 0) return res.status(400).json({ message: 'Price must be a number greater than or equal to zero' });
    if (!categories.includes(category)) return res.status(400).json({ message: 'Invalid category' });
    const item = await MenuItem.create(req.body);
    return res.status(201).json(item);
  } catch (error) { return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message }); }
}

async function updateMenuItem(req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid menu item id' });
    if (req.body.price !== undefined && (typeof req.body.price !== 'number' || req.body.price < 0)) return res.status(400).json({ message: 'Price must be a number greater than or equal to zero' });
    if (req.body.category !== undefined && !categories.includes(req.body.category)) return res.status(400).json({ message: 'Invalid category' });
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.status(200).json(item);
  } catch (error) { return res.status(error.name === 'ValidationError' ? 400 : 500).json({ message: error.message }); }
}

async function deleteMenuItem(req, res) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid menu item id' });
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    return res.status(200).json({ message: 'Menu item deleted' });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

module.exports = { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };

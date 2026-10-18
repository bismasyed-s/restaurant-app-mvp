const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}

function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

async function register(req, res) {
  try {
    const { name, email, password, role = 'customer' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required' });
    if (password.length < 8 || !/\d/.test(password)) return res.status(400).json({ message: 'Password must have at least 8 characters and one digit' });
    if (!['customer', 'manager'].includes(role)) return res.status(400).json({ message: 'Role must be customer or manager' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'Email is already registered' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 10), role });
    return res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    const status = error.code === 11000 ? 409 : error.name === 'ValidationError' ? 400 : 500;
    return res.status(status).json({ message: error.code === 11000 ? 'Email is already registered' : error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Email or password is incorrect' });
    return res.status(200).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) { return res.status(500).json({ message: error.message }); }
}

async function getMe(req, res) {
  try { return res.status(200).json(publicUser(req.user)); }
  catch (error) { return res.status(500).json({ message: error.message }); }
}

module.exports = { register, login, getMe };

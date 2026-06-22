const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'quickbite_secret');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const ownerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'owner') return next();
  res.status(403).json({ message: 'Access denied: Owner only' });
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'quickbite_secret', { expiresIn: '7d' });
};

module.exports = { protect, ownerOnly, generateToken };

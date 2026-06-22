const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, async (req, res) => {
  try { const user = await User.findById(req.user._id); res.json({ success: true, user }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, collegeId } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, collegeId }, { new: true });
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: (user.notifications || []).reverse() });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/notifications/read', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { 'notifications.$[].read': true } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, ownerOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, categories });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, ownerOnly, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, category: cat });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

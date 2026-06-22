const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const { protect, ownerOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, search, available } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    if (available === 'true') query.isAvailable = true;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    const items = await FoodItem.find(query).populate('category', 'name icon').sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id).populate('category', 'name icon');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, item });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, ownerOnly, async (req, res) => {
  try {
    const item = await FoodItem.create(req.body);
    await item.populate('category', 'name icon');
    res.status(201).json({ success: true, item });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('category', 'name icon');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, item });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.patch('/:id/availability', protect, ownerOnly, async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    await item.populate('category', 'name icon');
    res.json({ success: true, item });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const { protect } = require('../middleware/auth');

// Get cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.foodItem');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add logic
router.post('/add', protect, async (req, res) => {
  try {
    const { foodItemId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(i => i.foodItem.toString() === foodItemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += (quantity || 1);
    } else {
      cart.items.push({ foodItem: foodItemId, quantity: quantity || 1 });
    }
    
    await cart.save();
    cart = await cart.populate('items.foodItem');
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update logic
router.put('/update', protect, async (req, res) => {
  try {
    const { foodItemId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(i => i.foodItem.toString() === foodItemId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
    }
    cart = await cart.populate('items.foodItem');
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove logic
router.delete('/remove/:id', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(i => i.foodItem.toString() !== req.params.id);
      await cart.save();
      cart = await cart.populate('items.foodItem');
    }
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
      cart = await cart.populate('items.foodItem');
    }
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

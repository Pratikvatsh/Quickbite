const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { protect, ownerOnly } = require('../middleware/auth');

// Place an order from cart (customer)
router.post('/', protect, async (req, res) => {
  try {
    const { specialInstructions, paymentMethod } = req.body;

    // Load cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.foodItem');
    if (!cart || !cart.items.length) return res.status(400).json({ message: 'Your cart is empty' });

    // Build order items from cart
    const items = cart.items
      .filter(i => i.foodItem)
      .map(i => ({
        menuItem: i.foodItem._id,
        name: i.foodItem.name,
        price: i.foodItem.price,
        quantity: i.quantity,
        image: i.foodItem.imageUrl || '',
      }));

    if (!items.length) return res.status(400).json({ message: 'No valid items in cart' });

    const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const estimatedTime = Math.ceil(items.reduce((s, i) => s + (i.quantity * 3), 10));

    const order = await Order.create({
      customer: req.user._id,
      items,
      totalAmount,
      estimatedTime,
      paymentMethod: paymentMethod || 'cash',
      specialInstructions: specialInstructions || '',
      statusHistory: [{ status: 'placed', timestamp: new Date() }],
    });

    // Clear cart after order
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    const populated = await Order.findById(order._id).populate('customer', 'name email');
    res.status(201).json({ order: populated });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get customer's own orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ order });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Get all orders (owner)
router.get('/', protect, ownerOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('customer', 'name email phone');
    res.json({ orders });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Update order status (owner)
router.patch('/:id/status', protect, ownerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('customer');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date() });
    await order.save();

    if (status === 'ready') {
      await User.findByIdAndUpdate(order.customer._id, {
        $push: {
          notifications: {
            message: `🎉 Order #${order.orderNumber} is ready for pickup!`,
            orderId: order._id
          }
        }
      });
    }
    res.json({ order });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;

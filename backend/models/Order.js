const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
  image: String
});

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['placed', 'preparing', 'ready', 'completed', 'cancelled'], 
    default: 'placed' 
  },
  paymentMethod: { type: String, default: 'cash' },
  estimatedTime: { type: Number, default: 15 },
  specialInstructions: { type: String, default: '' },
  orderNumber: { type: String, unique: true },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `QB${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

cartSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) => {
    const price = item.foodItem?.price ?? 0;
    return total + (price * item.quantity);
  }, 0);
});

module.exports = mongoose.model('Cart', cartSchema);

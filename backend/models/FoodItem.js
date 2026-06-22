const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  prepTime: {
    type: Number,
    default: 10
  },
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  calories: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

foodItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('FoodItem', foodItemSchema);

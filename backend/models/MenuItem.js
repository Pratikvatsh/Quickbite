const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String, default: '' },
  available: { type: Boolean, default: true },
  isVeg: { type: Boolean, default: true },
  preparationTime: { type: Number, default: 10 },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);

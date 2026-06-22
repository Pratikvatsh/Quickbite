const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'QuickBite API running 🍔' }));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickbite';

const connectDB = async () => {
  try {
    if (MONGO_URI.includes('localhost') || MONGO_URI.includes('cluster0')) {
      console.log('Using MongoDB Memory Server for local demo...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      MONGO_URI = mongoServer.getUri();
      
      // Auto-run seed if it's a fresh memory server
      if (process.env.NODE_ENV !== 'seed') {
          console.log('Running auto-seed for memory server...');
          process.env.MONGO_URI = MONGO_URI; // So seed.js uses the memory server
          const seedFn = require('./seed');
          await seedFn();
      }
    }
    
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGO_URI);
    }
    console.log('✅ MongoDB connected');
    
    // We only listen if we are not just importing server.js
    if (process.env.NODE_ENV !== 'seed') {
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

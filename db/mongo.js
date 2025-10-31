const mongoose = require('mongoose');

async function connectMongo() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/feynman_learning';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

module.exports = { connectMongo };

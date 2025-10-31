const mongoose = require('mongoose');

async function testMongoConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  try {
    // 尝试连接本地MongoDB
    console.log('📡 Attempting to connect to local MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/feynman_learning', {
      serverSelectionTimeoutMS: 5000, // 5秒超时
    });
    console.log('✅ Successfully connected to local MongoDB!');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log('❌ Local MongoDB connection failed:', error.message);
    
    // 尝试连接MongoDB Atlas (如果配置了)
    if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv://')) {
      try {
        console.log('📡 Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 10000, // 10秒超时
        });
        console.log('✅ Successfully connected to MongoDB Atlas!');
        await mongoose.disconnect();
        return true;
      } catch (atlasError) {
        console.log('❌ MongoDB Atlas connection failed:', atlasError.message);
      }
    }
    
    return false;
  }
}

// 运行测试
testMongoConnection().then(success => {
  if (success) {
    console.log('\n🎉 MongoDB connection test PASSED!');
    process.exit(0);
  } else {
    console.log('\n💡 MongoDB connection test FAILED!');
    console.log('\n📋 Solutions:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    console.log('3. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    process.exit(1);
  }
});

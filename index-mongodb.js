require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// MongoDB连接
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('请检查.env文件中的MONGO_URI配置');
  });

// 用户模型
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 知识点模型
const knowledgePointSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['pending', 'learning', 'mastered'], default: 'pending' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const KnowledgePoint = mongoose.model('KnowledgePoint', knowledgePointSchema);

// 路由
app.get('/', (req, res) => {
  res.send('Feynman Platform backend is running with MongoDB');
});

// 用户注册
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: '用户已存在' });
    }
    
    // 创建新用户
    const newUser = new User({
      username,
      email,
      password // 实际项目中应该加密
    });
    
    await newUser.save();
    
    res.json({ 
      msg: '注册成功',
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 用户登录
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ msg: '邮箱或密码错误' });
    }
    
    // 生成简单的token（实际项目中应该使用JWT）
    const token = 'jwt-token-' + Date.now();
    
    res.json({ 
      msg: '登录成功',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 获取知识点列表
app.get('/api/knowledge-points', async (req, res) => {
  try {
    const knowledgePoints = await KnowledgePoint.find().sort({ createdAt: -1 });
    res.json(knowledgePoints);
  } catch (error) {
    console.error('获取知识点错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 创建知识点
app.post('/api/knowledge-points', async (req, res) => {
  try {
    const { title, content, status } = req.body;
    
    const newKp = new KnowledgePoint({
      title,
      content,
      status: status || 'pending'
    });
    
    await newKp.save();
    
    res.json({ 
      msg: '创建成功',
      knowledgePoint: newKp
    });
  } catch (error) {
    console.error('创建知识点错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 更新知识点
app.put('/api/knowledge-points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;
    
    const kp = await KnowledgePoint.findByIdAndUpdate(
      id,
      { title, content, status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!kp) {
      return res.status(404).json({ msg: '知识点不存在' });
    }
    
    res.json({ 
      msg: '更新成功',
      knowledgePoint: kp
    });
  } catch (error) {
    console.error('更新知识点错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 删除知识点
app.delete('/api/knowledge-points/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const kp = await KnowledgePoint.findByIdAndDelete(id);
    if (!kp) {
      return res.status(404).json({ msg: '知识点不存在' });
    }
    
    res.json({ msg: '删除成功' });
  } catch (error) {
    console.error('删除知识点错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('使用MongoDB Atlas数据库');
});








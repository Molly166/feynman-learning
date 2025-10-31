const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 添加请求日志
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  next();
});

// 模拟数据存储
let users = [];

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'Feynman Platform backend is running' });
});

// 用户注册
app.post('/api/users/register', (req, res) => {
  console.log('=== 注册请求处理开始 ===');
  
  try {
    const { username, email, password } = req.body;
    
    console.log('接收到的数据:', { username, email, password });
    
    // 验证必需字段
    if (!username || !email || !password) {
      console.log('缺少必需字段');
      return res.status(400).json({ 
        msg: '缺少必需字段',
        received: { username, email, password }
      });
    }
    
    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log('用户已存在');
      return res.status(400).json({ msg: '用户已存在' });
    }
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      createdAt: new Date()
    };
    
    users.push(newUser);
    console.log('用户创建成功:', newUser);
    console.log('当前用户数量:', users.length);
    
    res.json({ 
      msg: '注册成功',
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email 
      }
    });
    
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      msg: '服务器错误',
      error: error.message,
      stack: error.stack
    });
  }
});

// 用户登录
app.post('/api/users/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(400).json({ msg: '邮箱或密码错误' });
    }
    
    const token = 'mock-token-' + Date.now();
    
    res.json({ 
      msg: '登录成功',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('全局错误处理:', err);
  res.status(500).json({ 
    msg: '服务器内部错误',
    error: err.message 
  });
});

app.listen(port, () => {
  console.log(`🚀 测试服务器运行在 http://localhost:${port}`);
  console.log('📝 详细日志已启用');
  console.log('🔍 请尝试注册并查看日志');
});








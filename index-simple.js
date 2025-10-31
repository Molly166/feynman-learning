require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟数据存储（内存中）
let users = [];
let knowledgePoints = [];

// 路由
app.get('/', (req, res) => {
  res.send('Feynman Platform backend is running');
});

// 用户注册
app.post('/api/users/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ msg: '用户已存在' });
    }
    
    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password, // 实际项目中应该加密
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    res.json({ 
      msg: '注册成功',
      user: { id: newUser.id, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ msg: '服务器错误' });
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
    
    // 生成简单的token（实际项目中应该使用JWT）
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

// 获取知识点列表
app.get('/api/knowledge-points', (req, res) => {
  try {
    res.json(knowledgePoints);
  } catch (error) {
    console.error('获取知识点错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 创建知识点
app.post('/api/knowledge-points', (req, res) => {
  try {
    const { title, content, status } = req.body;
    
    const newKp = {
      _id: Date.now().toString(),
      title,
      content,
      status: status || 'pending',
      createdAt: new Date()
    };
    
    knowledgePoints.push(newKp);
    
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
app.put('/api/knowledge-points/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;
    
    const kpIndex = knowledgePoints.findIndex(kp => kp._id === id);
    if (kpIndex === -1) {
      return res.status(404).json({ msg: '知识点不存在' });
    }
    
    knowledgePoints[kpIndex] = {
      ...knowledgePoints[kpIndex],
      title,
      content,
      status,
      updatedAt: new Date()
    };
    
    res.json({ 
      msg: '更新成功',
      knowledgePoint: knowledgePoints[kpIndex]
    });
  } catch (error) {
    console.error('更新知识点错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

// 删除知识点
app.delete('/api/knowledge-points/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const kpIndex = knowledgePoints.findIndex(kp => kp._id === id);
    if (kpIndex === -1) {
      return res.status(404).json({ msg: '知识点不存在' });
    }
    
    knowledgePoints.splice(kpIndex, 1);
    
    res.json({ msg: '删除成功' });
  } catch (error) {
    console.error('删除知识点错误:', error);
    res.status(500).json({ msg: '服务器错误' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('使用内存存储，无需MongoDB连接');
});








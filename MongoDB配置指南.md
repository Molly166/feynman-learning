# 🗄️ MongoDB配置指南

## 📋 配置步骤

### 第一步：设置数据库凭据
1. **双击 `配置MongoDB.bat`**
2. 输入您的MongoDB Atlas凭据：
   - 数据库用户名
   - 数据库密码
3. 脚本会自动创建 `.env` 文件

### 第二步：启动MongoDB版本
1. **双击 `启动MongoDB版本.bat`**
2. 等待服务启动完成
3. 访问 http://localhost:5173

## 🔧 手动配置（可选）

### 创建.env文件
```bash
# MongoDB Atlas 连接配置
MONGO_URI=mongodb+srv://<您的用户名>:<您的密码>@feynman-user.t3gcb96.mongodb.net/?retryWrites=true&w=majority&appName=feynman-user
PORT=3000
```

### 手动启动
```bash
# 安装依赖
npm install mongoose

# 启动MongoDB版本
node index-mongodb.js
```

## 🎯 版本对比

| 版本 | 数据库 | 数据持久化 | 适用场景 |
|------|--------|------------|----------|
| `index-simple.js` | 内存 | ❌ 重启丢失 | 开发测试 |
| `index-mongodb.js` | MongoDB Atlas | ✅ 永久保存 | 生产环境 |

## ✅ 验证配置成功

### 后端验证
- 控制台显示：`MongoDB connected successfully!`
- 访问 http://localhost:3000 返回正常

### 功能验证
1. 注册用户 → 数据保存到MongoDB
2. 创建知识点 → 数据保存到MongoDB
3. 重启服务 → 数据仍然存在

## 🚨 常见问题

### 1. MongoDB连接失败
**错误**: `MongoDB connection error`
**解决**: 
- 检查用户名和密码是否正确
- 确认IP白名单设置
- 验证连接字符串格式

### 2. 依赖缺失
**错误**: `Cannot find module 'mongoose'`
**解决**: 
```bash
npm install mongoose
```

### 3. 环境变量问题
**错误**: `MONGO_URI is not defined`
**解决**: 确保 `.env` 文件存在且格式正确

## 🎉 配置完成

配置成功后，您的费曼学习平台将：
- ✅ 使用真实的MongoDB Atlas数据库
- ✅ 数据永久保存
- ✅ 支持多用户
- ✅ 完整的CRUD功能

现在可以开始使用完整的费曼学习平台了！








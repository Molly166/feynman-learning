# 🎓 Feynman 学习平台

> AI驱动的个人高效学习与知识管理系统 - 基于费曼学习法的智能学习平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3.1-blue)](https://reactjs.org/)

## 📖 项目简介

Feynman 学习平台是一个基于费曼学习法理念构建的智能学习管理系统。通过AI技术（文本润色、智能评价、语音转录、自动出题）帮助用户更高效地掌握知识，形成完整的"学-练-评"学习闭环。

### ✨ 核心特性

- 🧠 **知识点管理**: 富文本编辑器（React-Quill），支持图文混排
- 🎤 **语音学习**: 基于Whisper的语音转文字，支持简体中文输出
- 🤖 **AI智能评价**: 对比知识点和用户复述，多维度评分和建议
- 📝 **AI文本润色**: 多种风格的专业文本润色
- 🎯 **AI智能出题**: 自动生成单选题和简答题，三种难度可选
- ✅ **自动复习标记**: 智能识别薄弱知识点，自动加入复习列表
- 📚 **RAG 知识库问答**：LangChain + 百度千帆 embedding + 本地 HNSWLib，支持私有知识库检索增强生成
- 🗺️ **知识图谱可视化**：ECharts 力导图展示知识点引用关系
- 🪐 **3D 知识宇宙**：Three.js + d3-force-3d 构建可交互的 3D 星图
- 💬 **AI Agent 聊天界面**：面向知识库的 Agent 页面，支持问答与错误提示
- 💻 **Electron 桌面端**：一键打包为 Windows/macOS 桌面应用
- 📲 **PWA**：支持安装到桌面 / 手机主屏、基础离线访问
- 🌏 **多语言支持**: 中英文界面切换
- 🔒 **安全认证**: JWT Token认证，密码加密存储
- 📱 **响应式设计**: 现代化的UI设计，适配各种屏幕

---

## 🛠️ 技术栈

### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT (jsonwebtoken)
- **加密**: bcryptjs
- **文件上传**: Multer
- **AI/RAG**: LangChain.js、@langchain/community、@langchain/baidu-qianfan、hnswlib-node

### 前端
- **框架**: React 18.3.1
- **构建工具**: Vite 5.4 (同时兼容 Electron / PWA)
- **路由**: React Router DOM 7
- **状态/上下文**: React Context、自定义 hooks
- **样式**: TailwindCSS 3.4 + 自定义 CSS
- **图形可视化**: ECharts 5、Three.js 0.172、d3-force-3d 3.x
- **富文本**: React-Quill 2.0
- **国际化**: react-i18next 16.2
- **HTTP客户端**: Axios 1.12
- **跨平台**: Electron 31 + electron-builder 25、vite-plugin-pwa 0.20

### AI/PWA/语音服务
- **语音识别**: OpenAI Whisper (自部署 Flask 服务)
- **文本处理**: DeepSeek Chat API（主）、硅基流动 API（备）
- **Embedding**: 百度千帆 Embedding API

---

## 📁 项目结构

```
FeynmanLearning/
├── feynman-platform-frontend/     # React前端应用
│   ├── src/
│   │   ├── api/                   # API客户端配置
│   │   ├── components/            # React组件
│   │   │   ├── Layout.jsx        # 布局组件
│   │   │   ├── ProtectedRoute.jsx # 路由保护
│   │   │   └── AudioRecorder.jsx  # 录音组件
│   │   ├── context/               # React Context
│   │   │   └── AuthContext.jsx    # 认证上下文
│   │   ├── pages/                 # 页面组件
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── KnowledgePointFormPage.jsx
│   │   │   ├── VoiceLearningPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── AgentPage.jsx              # AI 知识库助手
│   │   │   ├── GraphPage.jsx              # 2D 知识图谱
│   │   │   ├── ThreeJSPage.jsx            # Three.js 场景
│   │   │   └── KnowledgeUniversePage.jsx  # 3D 力导向知识宇宙
│   │   ├── i18n.js                # 国际化配置
│   │   └── App.jsx                 # 根组件
│   └── package.json
│
├── services/                      # 后端服务模块
│   └── vectorStoreService.js      # RAG 向量化与检索
│
├── feynman-platform-whisper-api/  # Whisper语音识别服务
│   ├── app.py                      # Flask应用
│   ├── requirements.txt            # Python依赖
│   └── README.md
│
├── controllers/                    # 后端控制器
│   ├── aiController.js             # AI功能控制器
│   └── whisperController.js        # 语音识别控制器
│
├── models/                         # 数据模型
│   ├── User.js                     # 用户模型
│   └── KnowledgePoint.js           # 知识点模型
│
├── routes/                         # API路由
│   ├── users.js
│   ├── knowledgePoints.js
│   ├── audio.js
│   ├── ai.js                       # AI功能 + RAG 问答
│   └── graph.js                    # 知识图谱数据
│
├── middleware/                     # 中间件
│   └── auth.js                     # JWT认证中间件
│
├── utils/                          # 工具函数
│   └── multi-llm-manager.js        # 多LLM管理器
│
├── index.js                        # 后端入口文件
├── package.json                    # 后端依赖
├── vector_store/                   # HNSWLib 索引（运行后生成）
└── .env                            # 环境变量配置（需要创建）
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **Python**: >= 3.8 (用于Whisper服务)
- **MongoDB**: 本地或MongoDB Atlas云数据库
- **npm** 或 **yarn**

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd FeynmanLearning
```

#### 2. 后端配置

```bash
# 安装后端依赖
npm install

# 启用 RAG 向量索引所需依赖（若已安装会自动跳过）
npm install langchain @langchain/community @langchain/baidu-qianfan hnswlib-node

# 创建 .env 文件
cp .env.example .env  # 如果存在，或手动创建

# 配置环境变量
```

**`.env` 文件配置**:
```env
# MongoDB配置
MONGO_URI=mongodb://localhost:27017/feynman_learning
# 或使用MongoDB Atlas
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/feynman_learning

# JWT密钥
JWT_SECRET=your_super_secret_jwt_key_here

# 端口配置
PORT=3000

# DeepSeek API配置（主用）
DEEPSEEK_API_KEY=sk-cd94c509e83447b68f81c0e087da9a56

# 硅基流动API配置（备用，可选）
SILICONFLOW_API_KEY=your_siliconflow_api_key_here

# 百度千帆Embedding API（RAG向量化必需）
QIANFAN_API_KEY=your_qianfan_api_key
QIANFAN_SECRET_KEY=your_qianfan_secret_key
```

#### 3. 前端配置

```bash
cd feynman-platform-frontend
npm install
```

#### 4. Whisper服务配置（可选）

```bash
cd feynman-platform-whisper-api
pip install -r requirements.txt
```

---

## 🎯 启动项目

### 方法一：手动启动（推荐用于开发）

#### 1. 启动后端服务

```bash
# 在项目根目录
node index.js
```

**预期输出**:
```
MongoDB connected successfully!
Server running at http://localhost:3000
```

#### 2. 启动前端服务

```bash
# 在 feynman-platform-frontend 目录
cd feynman-platform-frontend
npm run dev
```

**预期输出**:
```
  VITE v5.4.10  ready in XXXX ms
  ➜  Local:   http://localhost:5173/
```

#### 3. 启动Whisper服务（可选）

```bash
# 在 feynman-platform-whisper-api 目录
cd feynman-platform-whisper-api
python app.py
```

**预期输出**:
```
正在加载Whisper模型...
模型加载完毕！
启动Whisper API服务...
服务地址: http://localhost:5001
```

### 方法二：使用启动脚本（Windows）

1. **双击 `启动项目.bat`** - 自动启动后端和前端服务
2. **双击 `启动Whisper.bat`** - 启动语音识别服务（可选）

### 方法三：Electron 桌面应用

> 需在 `feynman-platform-frontend` 目录先运行 `npm install` 安装 Electron 相关依赖。

```bash
# 桌面端开发调试（会同时启动 Vite + Electron 窗口）
cd feynman-platform-frontend
npm run electron:dev

# 生成桌面应用安装包（Windows .exe / macOS .dmg）
npm run electron:build
# 打包完成后的文件位于 feynman-platform-frontend/release/
```

### 方法四：PWA（渐进式 Web App）

1. 构建产物
   ```bash
   cd feynman-platform-frontend
   npm run build
   npx serve -s dist
   ```
2. 打开 `http://localhost:3000`（或 serve 提示的地址），在浏览器地址栏点击“安装”。
3. Chrome DevTools → Application → Service Workers 可查看 `sw.js` 状态，Network 面板勾选 *Offline* 后刷新验证离线缓存。
4. 在手机浏览器访问同一局域网地址，即可“添加到主屏幕”获得类原生体验。

### 方法五：Docker 一键部署

1. 准备 `.env`（位于项目根目录，供后端使用）。Docker Compose 会自动挂载 `vector_store/` 目录以保存向量索引。
2. 首次构建与启动：
   ```bash
   docker-compose up -d --build
   ```
3. 服务访问：
   - 后端 API: `http://localhost:3000/api`
   - 前端（含代理）: `http://localhost:4173`
4. 停止与清理：
   ```bash
   docker-compose down
   ```
5. 如需自定义前端在构建时访问的 API 地址，可在 `docker-compose.yml` -> `frontend.build.args.VITE_API_BASE_URL` 处修改；非容器环境可在构建前设置 `VITE_API_BASE_URL`，或在部署后通过为 `window.__APP_API_BASE__` 赋值来覆盖。

---

## 📚 API 文档

### 认证

所有受保护的API需要在请求头中携带Token：
```
Authorization: Bearer <your_jwt_token>
```

### 用户相关 API

#### 注册用户
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "user@example.com",
  "password": "密码"
}
```

#### 用户登录
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "密码"
}

响应:
{
  "token": "jwt_token_string",
  "user": {
    "id": "user_id"
  }
}
```

#### 获取当前用户信息
```http
GET /api/users/me
Authorization: Bearer <token>

响应:
{
  "_id": "user_id",
  "username": "用户名",
  "email": "user@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

### 知识点相关 API

#### 获取知识点列表
```http
GET /api/knowledge-points
Authorization: Bearer <token>

响应: [知识点数组]
```

#### 获取单个知识点
```http
GET /api/knowledge-points/:id
Authorization: Bearer <token>
```

#### 创建知识点
```http
POST /api/knowledge-points
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "知识点标题",
  "content": "知识点内容（HTML格式）",
  "status": "not_started" | "in_progress" | "mastered"
}
```

#### 更新知识点
```http
PUT /api/knowledge-points/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题",
  "content": "新内容",
  "status": "mastered"
}
```

#### 删除知识点
```http
DELETE /api/knowledge-points/:id
Authorization: Bearer <token>
```

#### 标记复习状态
```http
PATCH /api/knowledge-points/:id/review-list
Authorization: Bearer <token>
Content-Type: application/json

{
  "reviewList": true
}
```

### AI功能 API

#### 文本润色
```http
POST /api/ai/polish
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "需要润色的文本",
  "style": "concise" | "formal" | "academic" | "friendly"
}

响应:
{
  "result": "润色后的文本",
  "provider": "DeepSeek" | "SiliconFlow"
}
```

#### 智能评价
```http
POST /api/ai/evaluate
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "需要评价的文本"
}

响应:
{
  "polishedText": "润色后的文本",
  "accuracy": 85,
  "completeness": 80,
  "expression": 75,
  "overallScore": 80,
  "evaluation": "综合评价文字",
  "strengths": ["优点1", "优点2"],
  "weaknesses": ["弱点1", "弱点2"]
}
```

#### 费曼学习法评估
```http
POST /api/ai/evaluate-feynman
Authorization: Bearer <token>
Content-Type: application/json

{
  "originalContent": "原始知识点内容",
  "transcribedText": "用户复述的文本",
  "knowledgePoint": "知识点标题"
}

响应: 同上（智能评价响应格式）
```

#### 生成题目
```http
POST /api/ai/generate-question
Authorization: Bearer <token>
Content-Type: application/json

{
  "knowledgePointContent": "知识点内容",
  "difficulty": "基础" | "中等" | "困难",
  "questionType": "single-choice" | "short-answer"
}

响应（单选题）:
{
  "type": "single-choice",
  "difficulty": "中等",
  "question": "题干",
  "options": {
    "A": "选项A",
    "B": "选项B",
    "C": "选项C",
    "D": "选项D"
  },
  "answer": "C",
  "explanation": "答案解析",
  "provider": "DeepSeek"
}

响应（简答题）:
{
  "type": "short-answer",
  "difficulty": "中等",
  "question": "题干",
  "answer_key_points": ["要点1", "要点2", "要点3"],
  "provider": "DeepSeek"
}
```

#### AI评分答案（简答题）
```http
POST /api/ai/grade-answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "题目",
  "answerKeyPoints": ["要点1", "要点2"],
  "studentAnswer": "学生的答案"
}

响应:
{
  "isCorrect": true,
  "score": 85,
  "explanation": "评分理由",
  "provider": "DeepSeek"
}
```

#### RAG 知识库问答
```http
POST /api/ai/rag-qa
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "React Hooks 的优势是什么？"
}

响应:
{
  "answer": "基于知识库检索到的上下文生成的回答，若无匹配将提示无法回答。"
}
```

### 知识图谱 / 可视化 API

#### 获取知识图谱数据
```http
GET /api/graph/knowledge-map
Authorization: Bearer <token>

响应:
{
  "nodes": [
    { "id": "kp1", "name": "React Hooks", "symbolSize": 28, "status": "mastered", "reviewList": false, "value": "内容摘要" }
  ],
  "links": [
    { "source": "kp1", "target": "kp2", "label": { "show": true, "formatter": "引用" } }
  ]
}
```

### 音频处理 API

#### 语音转录
```http
POST /api/audio/transcribe
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  audio: <音频文件>

响应:
{
  "result": "转录的文字内容"
}
```

#### 健康检查
```http
GET /api/audio/health
Authorization: Bearer <token>

响应:
{
  "status": "Whisper API is healthy",
  "whisperStatus": {
    "status": "healthy",
    "model": "whisper-small"
  }
}
```

---

## 💡 使用指南

### 1. 注册和登录

1. 访问 `http://localhost:5173`
2. 点击"注册"创建新账号
3. 填写用户名、邮箱和密码
4. 注册成功后自动登录

### 2. 创建知识点

1. 在主页点击"新建知识点"按钮
2. 使用富文本编辑器输入标题和内容
3. 选择知识点状态（待学习/学习中/已掌握）
4. 点击"保存"

### 3. 语音学习

1. 在知识点卡片上点击"语音学习"
2. 点击"开始录音"按钮
3. 复述知识点内容
4. 点击"停止录音"
5. 点击"转录为文字"
6. 系统自动进行AI评价，显示：
   - 润色后的文本
   - 综合得分和分项得分
   - 综合评价
   - 优点和改进建议

### 4. AI智能测评

1. 在知识点卡片上点击"开始测评"
2. 选择难度（基础/中等/困难）和题型（单选题/简答题）
3. AI自动生成题目
4. 作答并提交
5. 查看评分结果和解析
6. 回答错误时，知识点自动标记为需复习

### 5. 文本润色和评价

1. 在主页的"AI文本润色与智能评价"区域
2. 输入需要润色的文本
3. 选择风格（简洁/正式/学术/亲切）
4. 点击"开始润色"或"开始评价"
5. 查看AI处理结果

---

## 🔧 配置说明

### MongoDB 配置

#### 使用本地MongoDB
```env
MONGO_URI=mongodb://localhost:27017/feynman_learning
```

#### 使用MongoDB Atlas（推荐）
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群
3. 获取连接字符串
4. 配置到 `.env` 文件中

### AI API 密钥配置

#### DeepSeek API
1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册并登录
3. 在控制台创建API Key
4. 配置到 `.env`: `DEEPSEEK_API_KEY=your_key_here`

#### 硅基流动 API（可选）
1. 访问 [siliconflow.cn](https://siliconflow.cn)
2. 注册并登录
3. 创建API Key
4. 配置到 `.env`: `SILICONFLOW_API_KEY=your_key_here`

> **注意**: 项目默认使用DeepSeek作为主用服务，硅基流动作为备用服务。

#### 百度千帆 Embedding API（RAG向量服务必需）
1. 访问 [百度智能云控制台](https://console.bce.baidu.com/qianfan/ais/console/applicationConsole/application) 创建应用。
2. 复制 `API Key` 与 `Secret Key`。
3. 配置到 `.env`：
   ```env
   QIANFAN_API_KEY=your_qianfan_api_key
   QIANFAN_SECRET_KEY=your_qianfan_secret_key
   ```
4. 首次运行会在项目根目录自动生成 `vector_store/` 文件夹，用于存储本地向量索引，请勿手动修改其中内容。

> **提示**: 若遇到“每日请求次数上限”错误，请在百度千帆控制台查看用量或更换更高配额的密钥。

---

## 🐛 常见问题

### Q: 后端启动失败，提示MongoDB连接错误
**A**: 
- 检查 `.env` 文件中的 `MONGO_URI` 是否正确
- 确认MongoDB服务已启动
- 如果使用MongoDB Atlas，检查网络白名单设置

### Q: 前端无法连接到后端
**A**: 
- 确认后端服务运行在 `http://localhost:3000`
- 检查 `feynman-platform-frontend/src/api/axios.js` 中的 `baseURL` 配置
- 查看浏览器控制台是否有CORS错误

### Q: 语音转录失败
**A**: 
- 确认Whisper服务已启动（`http://localhost:5001`）
- 检查麦克风权限是否授予
- 确认音频文件格式正确（支持wav/mp3等）

### Q: AI功能返回500错误
**A**: 
- 检查 `.env` 文件中是否配置了正确的API密钥
- 确认API密钥有效且未过期
- 查看后端控制台的详细错误信息

### Q: 登录后仍显示广告页面
**A**: 
- 检查浏览器控制台是否有认证错误
- 确认Token是否正确存储
- 尝试清除浏览器缓存后重新登录

---

## 🎓 学习路径

### 基础功能（已实现）
- ✅ 用户注册和登录
- ✅ 知识点CRUD操作
- ✅ 富文本编辑器
- ✅ 语音学习功能

### AI功能（已实现）
- ✅ AI文本润色
- ✅ AI智能评价
- ✅ AI自动出题
- ✅ AI自动评分

### 进阶功能（可选扩展）
- 📝 知识点搜索
- 📊 学习统计和进度追踪
- 🏷️ 知识点标签和分类
- 📱 移动端App
- 🔔 学习提醒和通知

---

## 📈 项目特色

### 1. 完整的"学-练-评"闭环
- **学**: 创建和管理知识点
- **练**: AI出题，答题练习
- **评**: AI智能评价，自动标记薄弱环节

### 2. 多LLM架构
- 优先使用DeepSeek官方API
- 自动回退到硅基流动免费API
- 确保服务高可用性

### 3. 智能复习系统
- 答题错误自动标记
- AI评价低于60分自动标记
- Dashboard可视化复习提醒

### 4. 私有向量知识库（RAG）
- 使用 LangChain.js + HNSWLib 构建本地向量索引
- 知识点创建/更新时自动切分、嵌入并写入 `vector_store`
- 接入百度千帆 Embedding API，保障中文语义向量效果
- 为后续的检索式问答和 Agent 能力提供数据基础

### 5. 立体可视化 + 跨平台
- ECharts 力导图 + Three.js + d3-force-3d 打造二维/三维知识网络
- Electron 桌面端、PWA 移动端，一次开发多端部署
- React 18 + Vite 5 + TailwindCSS 高效开发体验

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 贡献步骤
1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📝 更新日志

### v1.0.0 (2025-01-30)
- ✅ 完成9次课程的所有实验要求
- ✅ 实现完整的知识点管理功能
- ✅ 集成AI文本润色和智能评价
- ✅ 实现AI出题和智能测评系统
- ✅ 支持多语言（中英文）
- ✅ 实现Whisper语音识别服务

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 👥 作者

- **开发团队** - Feynman Learning Platform Team

---

## 🙏 致谢

- [React](https://reactjs.org/) - 前端框架
- [Express.js](https://expressjs.com/) - 后端框架
- [MongoDB](https://www.mongodb.com/) - 数据库
- [OpenAI Whisper](https://github.com/openai/whisper) - 语音识别
- [DeepSeek](https://www.deepseek.com/) - AI大模型
- [硅基流动](https://siliconflow.cn/) - AI服务平台

---

## 📞 支持

如有问题或建议，请：
- 提交 [Issue](https://github.com/your-repo/issues)
- 发送邮件至: support@feynman-platform.com

---

## 🌟 如果这个项目对你有帮助，请给个Star！

---

**Happy Learning with Feynman! 🚀**


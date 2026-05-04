# Feynman Android Shell

`android-shell` 是第二阶段“安卓平台开发”作业对应的原生 Kotlin WebView 套壳工程，用于把 `feynman-platform-frontend` 与现有后端服务集成到 Android 应用中。

## 已完成能力

- 加载费曼学习平台前端页面，默认指向模拟器地址 `http://10.0.2.2:5173/welcome`
- 通过查询参数自动覆盖前端 API 地址，解决 WebView 中 `localhost` 无法访问宿主机的问题
- 提供返回、首页、刷新、运行时地址配置按钮
- 提供错误提示卡片和重试入口
- 提供 `AndroidBridge` JavaScript 接口，支持 Toast、设备信息和页面重载
- 提供性能模式开关，便于记录优化前后加载时延

## 采用的优化策略

1. WebView 内核预热：应用启动时预创建并预热 WebView
2. 自适应缓存策略：联网时正常加载，离线时优先命中缓存
3. 硬件加速与渲染优先级：开启硬件加速并设置渲染优先级
4. 页面状态恢复：保存 WebView 状态，减少重复加载

## 开发前准备

1. 安装 Android Studio 与 Android SDK
2. 安装 JDK 17
3. 启动 Web 前端与后端

```bash
cd /Users/bytedance/Documents/class/feynman-learning
node index.js
```

```bash
cd /Users/bytedance/Documents/class/feynman-learning/feynman-platform-frontend
npm install
npm run dev
```

## 导入与运行

1. 用 Android Studio 打开 `android-shell`
2. 首次打开后等待 Gradle 同步
3. 连接安卓模拟器或真机
4. 运行 `app` 模块
5. 如果是真机，把“配置”中的前端地址和 API 地址改成电脑局域网 IP

## 打包建议

1. `Build > Generate Signed Bundle / APK`
2. 发布格式优先选择 `Android App Bundle`
3. release 构建已开启 `minifyEnabled` 与 `shrinkResources`
4. 签名证书请单独保存，避免后续无法升级应用

## 测试建议

- 正常打开首页
- 登录/注册
- 新建知识点
- AI 页面与知识图谱页面
- 断网后检查错误卡片与重试逻辑
- 分别关闭/开启优化模式，记录最近加载耗时

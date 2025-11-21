# 百度千帆 API 配置说明

## 问题说明

如果遇到错误："API配置错误，请检查QIANFAN_API_KEY和QIANFAN_SECRET_KEY环境变量"，说明需要配置百度千帆 API 密钥。

## 配置步骤

### 1. 获取百度千帆 API 密钥

1. 访问 [百度智能云控制台](https://console.bce.baidu.com/)
2. 登录你的百度账号
3. 进入 **千帆大模型平台**
4. 在 **应用接入** 或 **API Key管理** 中创建新的 API Key
5. 获取 `API Key` 和 `Secret Key`

### 2. 配置环境变量

打开项目根目录的 `.env` 文件，找到以下两行：

```env
QIANFAN_API_KEY=your_qianfan_api_key
QIANFAN_SECRET_KEY=your_qianfan_secret_key
```

将 `your_qianfan_api_key` 和 `your_qianfan_secret_key` 替换为你从百度千帆平台获取的真实密钥：

```env
QIANFAN_API_KEY=你的实际API_Key
QIANFAN_SECRET_KEY=你的实际Secret_Key
```

### 3. 重启后端服务

配置完成后，**必须重启后端服务**才能加载新的环境变量：

1. 停止当前运行的后端服务（按 `Ctrl+C`）
2. 重新启动：`node index.js`

### 4. 验证配置

重启后，尝试在 AI 助手页面提问，如果不再出现 API 配置错误，说明配置成功。

## 注意事项

- `.env` 文件包含敏感信息，**不要**将其提交到 Git 仓库
- 确保 `.env` 文件在项目根目录（与 `index.js` 同级）
- 如果使用占位符值（`your_qianfan_api_key`），API 调用会失败

## 备用方案

如果暂时无法获取百度千帆 API 密钥，可以：

1. 使用其他 AI 服务（需要修改代码）
2. 暂时禁用 RAG 功能
3. 使用模拟数据测试前端界面

## 相关文档

- [百度千帆官方文档](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)
- [LangChain 百度千帆集成文档](https://js.langchain.com/docs/integrations/llms/baidu_qianfan)


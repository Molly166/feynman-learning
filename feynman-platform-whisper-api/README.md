# Whisper API 服务

这是一个基于 OpenAI Whisper 模型的语音转文字 API 服务。

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行服务

```bash
python app.py
```

服务将在 http://localhost:5001 启动

## API 端点

### POST /transcribe
上传音频文件进行转录

**请求:**
- Content-Type: multipart/form-data
- 参数: audio (文件)

**响应:**
```json
{
  "result": "转录的文字内容"
}
```

### GET /health
健康检查

**响应:**
```json
{
  "status": "healthy",
  "model": "whisper-base"
}
```

## 注意事项

- 首次运行时会自动下载 Whisper 模型文件
- 模型文件较大，请确保网络连接稳定
- 建议使用 GPU 加速以获得更好的性能


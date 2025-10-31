from flask import Flask, request, jsonify
import whisper
import os
import tempfile
import opencc

app = Flask(__name__)

# 加载模型 (这步会比较慢，只在启动时执行一次)
print("正在加载Whisper模型...")
model = whisper.load_model("small")  # 升级到small模型，准确率更高
print("模型加载完毕！")

# 初始化繁体转简体转换器
cc = opencc.OpenCC('t2s')  # 繁体转简体
print("简体中文转换器初始化完成！")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    
    # 创建临时文件
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
        temp_path = temp_file.name
        audio_file.save(temp_path)

    try:
        # 使用Whisper进行转录，指定语言为中文以提升准确率
        result = model.transcribe(temp_path, language='zh', task='transcribe')
        # 删除临时文件
        os.remove(temp_path)
        
        # 获取转录文本并转换为简体中文
        transcribed_text = result['text'].strip()
        # 使用opencc将繁体转为简体
        simplified_text = cc.convert(transcribed_text)
        
        print("原始转录结果:", transcribed_text)
        print("简体中文结果:", simplified_text)
        return jsonify({"result": simplified_text})
    except Exception as e:
        # 确保即使出错也删除临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"转录错误: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model": "whisper-small"})

if __name__ == '__main__':
    print("启动Whisper API服务...")
    print("服务地址: http://localhost:5001")
    print("健康检查: http://localhost:5001/health")
    app.run(host='0.0.0.0', port=5001, debug=True)


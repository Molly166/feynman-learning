from flask import Flask, request, jsonify
import whisper
import os

app = Flask(__name__)

# 加载模型 (这步会比较慢，只在启动时执行一次)
print("正在加载Whisper模型...")
model = whisper.load_model("base") # 使用基础模型
print("模型加载完毕！")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    
    # 为了让whisper能处理，先保存为临时文件
    temp_path = "temp_audio.wav"
    audio_file.save(temp_path)

    try:
        # 使用Whisper进行转录
        result = model.transcribe(temp_path)
        # 删除临时文件
        os.remove(temp_path)
        
        print("转录结果:", result['text'])
        return jsonify({"result": result['text']})
    except Exception as e:
        # 确保即使出错也删除临时文件
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) # 在5001端口运行
from flask import Flask, request, jsonify
import whisper
import os

app = Flask(__name__)

# ����ģ�� (�ⲽ��Ƚ�����ֻ������ʱִ��һ��)
print("���ڼ���Whisperģ��...")
model = whisper.load_model("base") # ʹ�û���ģ��
print("ģ�ͼ�����ϣ�")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    
    # Ϊ����whisper�ܴ����ȱ���Ϊ��ʱ�ļ�
    temp_path = "temp_audio.wav"
    audio_file.save(temp_path)

    try:
        # ʹ��Whisper����ת¼
        result = model.transcribe(temp_path)
        # ɾ����ʱ�ļ�
        os.remove(temp_path)
        
        print("ת¼���:", result['text'])
        return jsonify({"result": result['text']})
    except Exception as e:
        # ȷ����ʹ����Ҳɾ����ʱ�ļ�
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) # ��5001�˿�����
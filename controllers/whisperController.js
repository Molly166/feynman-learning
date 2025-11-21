// controllers/whisperController.js
const axios = require('axios');
const FormData = require('form-data');

exports.transcribeAudioLocal = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No audio file uploaded.' });
    }

    try {
        const form = new FormData();
        // req.file.buffer 是multer处理后的文件buffer
        // 需要设置文件名，因为Flask保存文件需要
        form.append('audio', req.file.buffer, { filename: 'audio.wav' });

        // 调用本地的Python Whisper API
        const response = await axios.post('http://localhost:5001/transcribe', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        res.json({ result: response.data.result });

    } catch (error) {
        console.error('Error calling local Whisper API:', error.message);
        res.status(500).json({ msg: 'Error during local transcription.' });
    }
};

exports.healthCheck = async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5001/health');
        res.json({ 
            status: 'Whisper API is healthy',
            whisperStatus: response.data 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'Whisper API is not available',
            error: error.message 
        });
    }
};















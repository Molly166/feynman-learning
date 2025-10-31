// routes/audio.js
const express = require('express');
const multer = require('multer');
const { transcribeAudioLocal, healthCheck } = require('../controllers/whisperController');
const auth = require('../middleware/auth');

const router = express.Router();

// 配置multer用于处理音频文件上传
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
    },
    fileFilter: (req, file, cb) => {
        // 检查文件类型
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

// 健康检查 - 检查Whisper API是否可用
router.get('/health', auth, healthCheck);

// 音频转录 - 需要认证
router.post('/transcribe', auth, upload.single('audio'), transcribeAudioLocal);

module.exports = router;








// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // ������ܿ�
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

// Dev health check
router.get('/health', (req, res) => {
    const hasJwtSecret = Boolean(process.env.JWT_SECRET);
    const mongoState = mongoose.connection?.readyState; // 1 connected, 2 connecting
    res.json({ hasJwtSecret, mongoState });
});

// ---ûע API (Ѽ) ---
// @route   POST /api/users/register
// @desc    עһû
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 基本校验
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Missing required fields' });
        }

        // 1. 校验是否已存在（用户名或邮箱任一重复）
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. ûʵ
        user = new User({ username, email, password });

        // 3. ȫġйϣ
        // ⣺ʹ bcrypt ⡣һΡsaltһַ
        // Ȼκԭʼһйϣ㡣
        // ȷʹûͬ룬ݿеĹϣֵҲȫͬ
        const salt = await bcrypt.genSalt(10); // 10ǰȫǿȣֵԽԽȫԽʱ
        user.password = await bcrypt.hash(password, salt); // ɼܺ

        // 4. ûݿ
        await user.save();

        // 5. עɹֱJWTأʵעԶ¼
        const payload = {
            user: {
                id: user.id
            }
        };

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ msg: 'Server Error' });
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err.message);
                    return res.status(500).json({ msg: 'Server Error' });
                }
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        // 处理唯一索引冲突（防止500）
        if (err && err.code === 11000) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ msg: 'Server Error', ...(isProd ? {} : { error: err.message }) });
    }
});

// ---û¼ API ---
// @route   POST /api/users/login
// @desc    û¼ȡtoken
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. ûǷ
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. ȫġȽ
        // ʹ bcrypt.compare ȫرȽϿͻ˴ԭʼݿд洢Ĺϣ롣
        // Զֵġֻƥ䣬Ż᷵true
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) {
            // 处理历史脏数据（明文密码导致 compare 抛错）
            console.error('bcrypt compare error:', e.message);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. ¼ɹJWT
        const payload = {
            user: {
                id: user.id
            }
        };

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing');
            return res.status(500).json({ msg: 'Server Error' });
        }

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) {
                    console.error('JWT sign error:', err.message);
                    return res.status(500).json({ msg: 'Server Error' });
                }
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/users/me
// @desc    获取当前用户信息
// @access  Private
const auth = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: '用户不存在' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: '服务器错误' });
    }
});

module.exports = router;
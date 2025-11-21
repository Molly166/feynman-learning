// routes/knowledgePoints.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // ֤м
const KnowledgePoint = require('../models/KnowledgePoint');
const { addKnowledgePointToStore } = require('../services/vectorStoreService');

// @route   POST /api/knowledge-points
// @desc   һµ֪ʶ
// @access  Private (Ҫ¼)
router.post('/', auth, async (req, res) => { // ʹauthм
    try {
        const { title, content, status, reviewList } = req.body;
        const newKp = new KnowledgePoint({
            title,
            content,
            status,
            reviewList,
            user: req.user.id //authмӵreq.userлȡûID
        });
        const kp = await newKp.save();
        
        // 异步调用，无需等待其完成即可返回响应给用户，提升体验
        addKnowledgePointToStore(kp);
        
        res.json(kp);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/knowledge-points
// @desc    ȡǰû֪ʶ
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const kps = await KnowledgePoint.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(kps);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/knowledge-points/:id
// @desc    ȡ֪ʶ
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        //ID֪ʶ
        const kp = await KnowledgePoint.findById(req.params.id);
        
        // ֪ʶ㲻ڣ404
        if (!kp) {
            return res.status(404).json({ msg: '֪ʶ㲻' });
        }
        
        // ȷǸûԼ֪ʶ
        if (kp.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'ûȨ޷ʴ֪ʶ' });
        }
        
        // ֪ʶ
        res.json(kp);
    } catch (err) {
        console.error(err.message);
        // IDʽȷظѺõĴϢ
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: '֪ʶ㲻' });
        }
        res.status(500).send('');
    }
});


// @route   PUT /api/knowledge-points/:id
// @desc   һ֪ʶ
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let kp = await KnowledgePoint.findById(req.params.id);
        if (!kp) return res.status(404).json({ msg: 'Knowledge point not found' });
        // ȷǸûԼ֪ʶ
        if (kp.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        const { title, content, status, reviewList } = req.body;
        const oldContent = kp.content; // 保存更新前的内容
        kp = await KnowledgePoint.findByIdAndUpdate(
            req.params.id,
            { $set: { title, content, status, reviewList } },
            { new: true } // ظºĵ
        );
        
        // 当内容发生变化时，才重新索引
        if (kp.content !== oldContent) {
            addKnowledgePointToStore(kp);
        }
        
        res.json(kp);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/knowledge-points/:id
// @desc    ɾһ֪ʶ
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let kp = await KnowledgePoint.findById(req.params.id);
        if (!kp) return res.status(404).json({ msg: 'Knowledge point not found' });
        if (kp.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await KnowledgePoint.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Knowledge point removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PATCH /api/knowledge-points/:id/review-list
// 只更新知识点reviewList字段
router.patch('/:id/review-list', auth, async (req, res) => {
    try {
        const kp = await KnowledgePoint.findById(req.params.id);
        if (!kp) return res.status(404).json({ msg: '知识点不存在' });
        if (kp.user.toString() !== req.user.id) return res.status(401).json({ msg: '无权限' });
        kp.reviewList = !!req.body.reviewList;
        await kp.save();
        res.json(kp);
    } catch (err) {
        res.status(500).json({ msg: '设置复习标记出错' });
    }
});

module.exports = router;

// routes/knowledgePoints.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // ������֤�м��
const KnowledgePoint = require('../models/KnowledgePoint');

// @route   POST /api/knowledge-points
// @desc    ����һ���µ�֪ʶ��
// @access  Private (��Ҫ��¼)
router.post('/', auth, async (req, res) => { // ������ʹ��auth�м��
    try {
        const { title, content, status, reviewList } = req.body;
        const newKp = new KnowledgePoint({
            title,
            content,
            status,
            reviewList,
            user: req.user.id // ��auth�м�����ӵ�req.user�л�ȡ�û�ID
        });
        const kp = await newKp.save();
        res.json(kp);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/knowledge-points
// @desc    ��ȡ��ǰ�û�������֪ʶ��
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
// @desc    ��ȡ����֪ʶ������
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        // ����ID����֪ʶ��
        const kp = await KnowledgePoint.findById(req.params.id);
        
        // ���֪ʶ�㲻���ڣ�����404����
        if (!kp) {
            return res.status(404).json({ msg: '֪ʶ�㲻����' });
        }
        
        // ȷ���Ǹ��û��Լ���֪ʶ��
        if (kp.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'û��Ȩ�޷��ʴ�֪ʶ��' });
        }
        
        // ����֪ʶ������
        res.json(kp);
    } catch (err) {
        console.error(err.message);
        // ���ID��ʽ����ȷ�����ظ��ѺõĴ�����Ϣ
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: '֪ʶ�㲻����' });
        }
        res.status(500).send('����������');
    }
});


// @route   PUT /api/knowledge-points/:id
// @desc    ����һ��֪ʶ��
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        let kp = await KnowledgePoint.findById(req.params.id);
        if (!kp) return res.status(404).json({ msg: 'Knowledge point not found' });
        // ȷ���Ǹ��û��Լ���֪ʶ��
        if (kp.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        const { title, content, status, reviewList } = req.body;
        kp = await KnowledgePoint.findByIdAndUpdate(
            req.params.id,
            { $set: { title, content, status, reviewList } },
            { new: true } // ���ظ��º���ĵ�
        );
        res.json(kp);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/knowledge-points/:id
// @desc    ɾ��һ��֪ʶ��
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let kp = await KnowledgePoint.findById(req.params.id);
        if (!kp) return res.status(404).json({ msg: 'Knowledge point not found' });
        if (kp.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await KnowledgePoint.findByIdAndRemove(req.params.id);
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
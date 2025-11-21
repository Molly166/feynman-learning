const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const KnowledgePoint = require('../models/KnowledgePoint');

// @route   GET /api/graph/knowledge-map
// @desc    获取当前用户的知识图谱数据
// @access  Private
router.get('/knowledge-map', auth, async (req, res) => {
    try {
        const knowledgePoints = await KnowledgePoint.find({ user: req.user.id }).sort({ createdAt: -1 });

        if (!knowledgePoints.length) {
            return res.json({ nodes: [], links: [] });
        }

        const nodes = knowledgePoints.map((kp) => {
            const content = kp.content || '';
            return {
                id: kp._id.toString(),
                name: kp.title || '未命名知识点',
                value: content.substring(0, 120),
                symbolSize: 20 + Math.min(Math.ceil(content.length / 50), 30),
                status: kp.status || 'draft',
                reviewList: !!kp.reviewList,
            };
        });

        const links = [];
        const titleMap = new Map(
            knowledgePoints
                .filter((kp) => kp.title)
                .map((kp) => [kp.title.trim().toLowerCase(), kp._id.toString()])
        );

        for (const sourceKp of knowledgePoints) {
            const sourceContent = (sourceKp.content || '').toLowerCase();
            if (!sourceContent) continue;

            for (const [targetTitleLower, targetId] of titleMap.entries()) {
                if (sourceKp._id.toString() === targetId) continue;

                if (sourceContent.includes(targetTitleLower)) {
                    links.push({
                        source: sourceKp._id.toString(),
                        target: targetId,
                        label: {
                            show: true,
                            formatter: '引用',
                        },
                    });
                }
            }
        }

        res.json({ nodes, links });
    } catch (error) {
        console.error('Error generating knowledge graph:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


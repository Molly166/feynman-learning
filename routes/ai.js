const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { polishText, evaluateText, evaluateFeynmanAttempt, generateQuestion, gradeAnswer } = require('../controllers/aiController');

// 文本润色
router.post('/polish', auth, polishText);

// 简单评价（仅评价文本）
router.post('/evaluate', auth, evaluateText);

// 完整的费曼学习法评估（对比知识点和转录文本）
router.post('/evaluate-feynman', auth, evaluateFeynmanAttempt);

// AI生成题目（支持单选题和简答题）
router.post('/generate-question', auth, generateQuestion);

// AI评分答案（用于简答题）
router.post('/grade-answer', auth, gradeAnswer);

module.exports = router;



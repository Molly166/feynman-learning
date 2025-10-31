const { polishText: polishWithLLM, evaluateFeynmanAttempt, generateQuestion, gradeAnswer } = require('../utils/multi-llm-manager');

// 文本润色（独立使用）
exports.polishText = async (req, res) => {
  const { text, style } = req.body;
  if (!text) {
    return res.status(400).json({ msg: '文本内容不能为空' });
  }

  try {
    const { result, provider } = await polishWithLLM(text, style, 'auto');
    res.json({ result, provider });
  } catch (error) {
    console.error('润色失败:', error);
    // 返回详细的错误信息
    const errorMsg = error.message || 'AI润色失败';
    res.status(500).json({ 
      msg: 'AI润色失败', 
      error: errorMsg,
      details: error.response?.data || error.stack 
    });
  }
};

// 简单评价（仅评价文本，不对比知识点）
exports.evaluateText = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ msg: '文本内容不能为空' });
  }

  try {
    // 使用空字符串作为知识点，仅评价文本本身
    const feedback = await evaluateFeynmanAttempt(text, text, '');
    res.json(feedback);
  } catch (error) {
    console.error('评价失败:', error);
    res.status(500).json({ msg: 'AI评价失败', error: error.message });
  }
};

// 完整的费曼学习法评估（对比知识点和转录文本）
exports.evaluateFeynmanAttempt = async (req, res) => {
  const { originalContent, transcribedText, knowledgePoint } = req.body;

  if (!originalContent || !transcribedText) {
    return res.status(400).json({ msg: '原始内容和转录文本都是必需的' });
  }

  try {
    const evaluationResult = await evaluateFeynmanAttempt(
      originalContent,
      transcribedText,
      knowledgePoint || ''
    );

    res.json(evaluationResult);
  } catch (error) {
    console.error('评估失败:', error);
    res.status(500).json({ msg: 'AI评估失败', error: error.message });
  }
};

// AI生成题目（支持单选题和简答题）
exports.generateQuestion = async (req, res) => {
  const { knowledgePointContent, difficulty, questionType } = req.body;

  if (!knowledgePointContent) {
    return res.status(400).json({ msg: '知识点内容不能为空' });
  }

  try {
    const question = await generateQuestion(
      knowledgePointContent,
      difficulty || '中等',
      questionType || 'single-choice'
    );

    res.json(question);
  } catch (error) {
    console.error('生成题目失败:', error);
    res.status(500).json({ msg: 'AI生成题目失败', error: error.message });
  }
};

// AI评分答案（用于简答题）
exports.gradeAnswer = async (req, res) => {
  const { question, answerKeyPoints, studentAnswer } = req.body;

  if (!question || !answerKeyPoints || !studentAnswer) {
    return res.status(400).json({ msg: '题目、答案要点和学生答案都是必需的' });
  }

  try {
    const gradeResult = await gradeAnswer(question, answerKeyPoints, studentAnswer);
    res.json(gradeResult);
  } catch (error) {
    console.error('评分失败:', error);
    res.status(500).json({ msg: 'AI评分失败', error: error.message });
  }
};

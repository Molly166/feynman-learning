const axios = require('axios');

// Provider-agnostic simple AI service with fallback
async function callAI({ prompt, task }) {
  const provider = process.env.AI_PROVIDER || 'mock';

  if (provider === 'openai') {
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY missing');
    const res = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: task === 'polish' ? '你是中文写作润色助手，保持原意，提高清晰、结构与语气。' : '你是中文学习评价助手，从清晰度、逻辑性、准确性、条理性打分（1-10），并给改进建议。输出JSON。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      },
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    return res.data.choices?.[0]?.message?.content?.trim() || '';
  }

  // Mock fallback to ensure feature availability without keys
  if (task === 'polish') {
    return `【润色结果】\n${prompt}

【说明】已进行基本断句与标点规范化（mock）`;
  }
  return JSON.stringify({
    clarity: 7,
    logic: 7,
    accuracy: 7,
    structure: 7,
    summary: '总体可读性良好，但可进一步增强论证细节。（mock）',
    suggestions: [
      '补充关键术语的定义',
      '用例或数据支撑核心结论',
      '拆分长句以提升可读性'
    ]
  });
}

exports.polishText = async (req, res) => {
  try {
    const { text, style = 'concise' } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ msg: 'text is required' });
    const prompt = `请根据风格「${style}」润色以下文本，保持原意，改进结构、用词与标点：\n\n${text}`;
    const content = await callAI({ prompt, task: 'polish' });
    res.json({ result: content });
  } catch (e) {
    console.error('polishText error:', e.message);
    res.status(500).json({ msg: 'AI polish failed' });
  }
};

exports.evaluateText = async (req, res) => {
  try {
    const { text, dimensions = ['clarity','logic','accuracy','structure'] } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ msg: 'text is required' });
    const prompt = `请对以下文本进行多维度评分（1-10）和建议，维度：${dimensions.join(', ')}。仅输出JSON：{clarity, logic, accuracy, structure, summary, suggestions[]}。\n\n文本：\n${text}`;
    const content = await callAI({ prompt, task: 'evaluate' });
    // Try parse JSON; if failed, wrap as raw
    try {
      const json = JSON.parse(content);
      return res.json({ result: json });
    } catch {
      return res.json({ result: content });
    }
  } catch (e) {
    console.error('evaluateText error:', e.message);
    res.status(500).json({ msg: 'AI evaluate failed' });
  }
};



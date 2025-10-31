const axios = require('axios');

// 硅基流动API配置（免费DeepSeek模型）
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;
const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';

// DeepSeek官方API配置（主用）
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-cd94c509e83447b68f81c0e087da9a56'; // 使用提供的key作为默认值
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';

/**
 * 使用硅基流动调用DeepSeek模型（免费）
 */
async function callSiliconFlow(messages, model = 'deepseek-ai/deepseek-chat') {
  const apiKey = SILICONFLOW_API_KEY || process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error('硅基流动API密钥未配置');
  }

  try {
    const response = await axios.post(
      `${SILICONFLOW_BASE_URL}/chat/completions`,
      {
        model: model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('硅基流动API返回格式异常');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      // API返回了错误响应
      const status = error.response.status;
      const data = error.response.data;
      throw new Error(`硅基流动API错误 (${status}): ${JSON.stringify(data)}`);
    } else if (error.request) {
      // 请求发送了但没有收到响应
      throw new Error('硅基流动API无响应，请检查网络连接');
    } else {
      // 其他错误
      throw new Error(`硅基流动API调用失败: ${error.message}`);
    }
  }
}

/**
 * 使用DeepSeek官方API（主用）
 */
async function callDeepSeekOfficial(messages) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API密钥未配置');
  }

  try {
    const response = await axios.post(
      `${DEEPSEEK_BASE_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('DeepSeek API返回格式异常');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response) {
      // API返回了错误响应
      const status = error.response.status;
      const data = error.response.data;
      throw new Error(`DeepSeek API错误 (${status}): ${JSON.stringify(data)}`);
    } else if (error.request) {
      // 请求发送了但没有收到响应
      throw new Error('DeepSeek API无响应，请检查网络连接');
    } else {
      // 其他错误
      throw new Error(`DeepSeek API调用失败: ${error.message}`);
    }
  }
}

/**
 * 文本润色
 */
async function polishText(text, style = 'concise', provider = 'auto') {
  const prompt = `你是AI写作专家。请将下方文本润色成更专业、地道的${style || '书面'}风格，` +
    `必须重新组织用词与句式，即使原文较好也要换一种表达方式输出，并使润色内容和原文整体有显著差异；` +
    `用更高级表达、结构更紧凑，体现正式且全部用标准简体中文，保持核心内容和信息不变。切忌抄原文，每一句都需有调整！\n原文：${text}`;

  // 优先尝试DeepSeek官方API
  if (DEEPSEEK_API_KEY) {
    try {
      const result = await callDeepSeekOfficial([{ role: 'user', content: prompt }]);
      return { result, provider: 'DeepSeek' };
    } catch (error) {
      console.warn('DeepSeek官方API失败，尝试硅基流动:', error.message);
      // 如果DeepSeek失败，且提供了硅基流动key，则尝试硅基流动
      if (SILICONFLOW_API_KEY) {
        try {
          const result = await callSiliconFlow([{ role: 'user', content: prompt }]);
          return { result, provider: 'SiliconFlow' };
        } catch (siliconError) {
          throw new Error(`所有LLM服务失败。DeepSeek: ${error.message}; SiliconFlow: ${siliconError.message}`);
        }
      } else {
        throw error;
      }
    }
  }

  // 如果没有DeepSeek key，尝试硅基流动
  if (SILICONFLOW_API_KEY) {
    try {
      const result = await callSiliconFlow([{ role: 'user', content: prompt }]);
      return { result, provider: 'SiliconFlow' };
    } catch (error) {
      throw new Error(`硅基流动API失败: ${error.message}`);
    }
  }

  throw new Error('未配置任何LLM API密钥');
}

/**
 * 评价学生的复述文本（对比知识点原文）
 */
async function evaluateFeynmanAttempt(originalContent, transcribedText, knowledgePoint = '') {
  const prompt = `你将扮演AI学习教练，请用标准简体中文严格输出对学生的以下文本进行综合评价：\n\n` +
    `【原始知识点内容】:\n${originalContent}\n\n` +
    `【学生的口头复述文本】:\n${transcribedText}\n\n` +
    `请完成以下任务：\n` +
    `1. 文本润色（polishedText）：将学生的复述文本润色成一段通顺、专业、书面化的文字。修正明显的语法错误和口语化表达，但保持其核心观点不变。必须与原文有显著差异，不能直接输出原文。\n` +
    `2. 综合评价（evaluation）：基于原始知识点，对学生的复述进行评价。指出其优点和可以改进的地方。\n` +
    `3. 评分：分别从准确性（accuracy，0-100分）、完整性（completeness，0-100分）、表达（expression，0-100分）三方面评分，并给出综合评分（overallScore，0-100分）。\n` +
    `4. 优缺点：各提供1-2项优点（strengths）和弱点（weaknesses）。\n\n` +
    `请只返回符合如下结构且全部字段全为简体中文的严格JSON（不要包含任何markdown代码块标记，只返回纯JSON）：\n` +
    `{\n` +
    `  "polishedText": "润色后的文本",\n` +
    `  "accuracy": 85,\n` +
    `  "completeness": 80,\n` +
    `  "expression": 75,\n` +
    `  "overallScore": 80,\n` +
    `  "evaluation": "详细的综合评价文字",\n` +
    `  "strengths": ["优点1", "优点2"],\n` +
    `  "weaknesses": ["弱点1", "弱点2"]\n` +
    `}`;

  try {
    let content;
    let provider = 'SiliconFlow';
    
    try {
      // 优先使用硅基流动（免费）
      content = await callSiliconFlow([
        { role: 'system', content: '你是一个专业的教育评估专家，擅长评估和优化教学内容。' },
        { role: 'user', content: prompt }
      ]);
    } catch (error) {
      console.warn('硅基流动API失败，尝试DeepSeek官方:', error.message);
      // 备用：使用DeepSeek官方
      if (DEEPSEEK_API_KEY) {
        content = await callDeepSeekOfficial([
          { role: 'system', content: '你是一个专业的教育评估专家，擅长评估和优化教学内容。' },
          { role: 'user', content: prompt }
        ]);
        provider = 'DeepSeek';
      } else {
        throw error;
      }
    }

    // 解析JSON响应
    let evaluationResult;
    try {
      // 移除可能的markdown代码块标记
      const cleanedContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      // 尝试提取JSON部分
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedContent;
      evaluationResult = JSON.parse(jsonString);
      
      // 添加提供者信息
      evaluationResult.provider = provider;
      
      return evaluationResult;
    } catch (parseError) {
      console.error('解析API响应失败:', parseError);
      console.error('原始响应:', content);
      // 返回一个基本评估结果
      return {
        polishedText: transcribedText,
        accuracy: 50,
        completeness: 50,
        expression: 50,
        overallScore: 50,
        evaluation: '无法解析API响应，请检查API配置或稍后重试。',
        strengths: ['AI服务暂时不可用'],
        weaknesses: ['需要重新尝试评估'],
        provider: provider,
        error: true
      };
    }
  } catch (error) {
    console.error('LLM API调用失败:', error);
    throw new Error(`AI评估失败: ${error.message}`);
  }
}

/**
 * 生成题目（支持单选题和简答题）
 */
async function generateQuestion(knowledgePointContent, difficulty = '中等', questionType = 'single-choice') {
  let prompt;
  
  if (questionType === 'single-choice') {
    // 单选题Prompt
    prompt = `你是一个专业的计算机科学出题专家。请根据以下提供的知识点内容和指定的难度，生成一个相关的单项选择题。

【知识点内容】:
"""
${knowledgePointContent}
"""

【指定难度】: ${difficulty}  (可选值为: 基础, 中等, 困难)

请严格按照以下JSON格式返回题目，不要包含任何额外的解释或文字，确保所有字段都存在。
{
  "type": "single-choice",
  "difficulty": "${difficulty}",
  "question": "这里是题干",
  "options": {
    "A": "选项A的内容",
    "B": "选项B的内容",
    "C": "选项C的内容",
    "D": "选项D的内容"
  },
  "answer": "C",
  "explanation": "这里是对正确答案的简短解释"
}`;
  } else {
    // 简答题Prompt
    prompt = `你是一个专业的计算机科学出题专家。请根据以下提供的知识点内容和指定的难度，生成一个相关的简答题。

【知识点内容】:
"""
${knowledgePointContent}
"""

【指定难度】: ${difficulty}  (可选值为: 基础, 中等, 困难)

请严格按照以下JSON格式返回题目，不要包含任何额外的解释或文字，确保所有字段都存在。
{
  "type": "short-answer",
  "difficulty": "${difficulty}",
  "question": "这里是简答题的题干",
  "answer_key_points": [
    "答案要点1",
    "答案要点2",
    "答案要点3"
  ]
}`;
  }

  try {
    let content;
    let provider = 'DeepSeek';
    
    // 优先尝试DeepSeek官方API
    if (DEEPSEEK_API_KEY) {
      try {
        content = await callDeepSeekOfficial([
          { role: 'system', content: '你是一个专业的出题专家，擅长生成教育类题目。' },
          { role: 'user', content: prompt }
        ]);
      } catch (error) {
        console.warn('DeepSeek官方API失败，尝试硅基流动:', error.message);
        if (SILICONFLOW_API_KEY) {
          content = await callSiliconFlow([
            { role: 'system', content: '你是一个专业的出题专家，擅长生成教育类题目。' },
            { role: 'user', content: prompt }
          ], 'deepseek-ai/deepseek-chat');
          provider = 'SiliconFlow';
        } else {
          throw error;
        }
      }
    } else if (SILICONFLOW_API_KEY) {
      content = await callSiliconFlow([
        { role: 'system', content: '你是一个专业的出题专家，擅长生成教育类题目。' },
        { role: 'user', content: prompt }
      ], 'deepseek-ai/deepseek-chat');
      provider = 'SiliconFlow';
    } else {
      throw new Error('未配置任何LLM API密钥');
    }

    // 解析JSON响应
    try {
      const cleanedContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedContent;
      const questionData = JSON.parse(jsonString);
      questionData.provider = provider;
      return questionData;
    } catch (parseError) {
      console.error('解析题目JSON失败:', parseError);
      console.error('原始响应:', content);
      throw new Error(`AI返回格式错误: ${parseError.message}`);
    }
  } catch (error) {
    console.error('生成题目失败:', error);
    throw new Error(`生成题目失败: ${error.message}`);
  }
}

/**
 * AI评分答案（用于简答题）
 */
async function gradeAnswer(question, answerKeyPoints, studentAnswer) {
  const prompt = `你是一个客观的计算机科学阅卷老师。请根据以下题目、答案要点和学生的回答，判断学生的回答是否正确，并给出解释。

【题目】:
${question}

【答案要点】:
${JSON.stringify(answerKeyPoints, null, 2)}

【学生的回答】:
${studentAnswer}

请严格按照以下JSON格式返回你的评判结果，不要包含任何额外的解释或文字。
{
  "isCorrect": true,
  "score": 85,
  "explanation": "这里是你的评判理由，比如：回答基本正确，覆盖了主要区别。或：回答混淆了State和Props的概念。"
}`;

  try {
    let content;
    let provider = 'DeepSeek';
    
    // 优先尝试DeepSeek官方API
    if (DEEPSEEK_API_KEY) {
      try {
        content = await callDeepSeekOfficial([
          { role: 'system', content: '你是一个客观的阅卷老师，擅长评判学生答案。' },
          { role: 'user', content: prompt }
        ]);
      } catch (error) {
        console.warn('DeepSeek官方API失败，尝试硅基流动:', error.message);
        if (SILICONFLOW_API_KEY) {
          content = await callSiliconFlow([
            { role: 'system', content: '你是一个客观的阅卷老师，擅长评判学生答案。' },
            { role: 'user', content: prompt }
          ], 'deepseek-ai/deepseek-chat');
          provider = 'SiliconFlow';
        } else {
          throw error;
        }
      }
    } else if (SILICONFLOW_API_KEY) {
      content = await callSiliconFlow([
        { role: 'system', content: '你是一个客观的阅卷老师，擅长评判学生答案。' },
        { role: 'user', content: prompt }
      ], 'deepseek-ai/deepseek-chat');
      provider = 'SiliconFlow';
    } else {
      throw new Error('未配置任何LLM API密钥');
    }

    // 解析JSON响应
    try {
      const cleanedContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedContent;
      const gradeResult = JSON.parse(jsonString);
      gradeResult.provider = provider;
      return gradeResult;
    } catch (parseError) {
      console.error('解析评分JSON失败:', parseError);
      console.error('原始响应:', content);
      throw new Error(`AI返回格式错误: ${parseError.message}`);
    }
  } catch (error) {
    console.error('评分答案失败:', error);
    throw new Error(`评分答案失败: ${error.message}`);
  }
}

module.exports = {
  polishText,
  evaluateFeynmanAttempt,
  generateQuestion,
  gradeAnswer,
  callSiliconFlow,
  callDeepSeekOfficial
};


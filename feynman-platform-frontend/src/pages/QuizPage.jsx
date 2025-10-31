// src/pages/QuizPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [knowledgePoint, setKnowledgePoint] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [shortAnswer, setShortAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 加载知识点内容
  useEffect(() => {
    const fetchKp = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/knowledge-points/${id}`);
        setKnowledgePoint(response.data);
      } catch (error) {
        console.error('加载知识点失败:', error);
        setError('加载知识点失败');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchKp();
    }
  }, [id]);

  // 获取题目
  const fetchQuestion = async (difficulty, questionType = 'single-choice') => {
    if (!knowledgePoint) return;
    
    setIsGenerating(true);
    setQuestion(null);
    setResult(null);
    setSelectedOption('');
    setShortAnswer('');
    setError('');

    try {
      const response = await apiClient.post('/ai/generate-question', {
        knowledgePointContent: knowledgePoint.content,
        difficulty: difficulty,
        questionType: questionType
      });
      setQuestion(response.data);
    } catch (error) {
      console.error('生成题目失败:', error);
      setError('生成题目失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 提交答案
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question) return;

    // 检查是否已选择答案或填写答案
    if (question.type === 'single-choice' && !selectedOption) {
      alert('请选择一个答案！');
      return;
    }
    
    if (question.type === 'short-answer' && !shortAnswer.trim()) {
      alert('请填写答案！');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let isCorrect = false;
      let explanation = '';

      if (question.type === 'single-choice') {
        // 单选题：前端直接判断
        isCorrect = selectedOption === question.answer;
        explanation = question.explanation || '';
      } else {
        // 简答题：调用AI评分
        const gradeResponse = await apiClient.post('/ai/grade-answer', {
          question: question.question,
          answerKeyPoints: question.answer_key_points,
          studentAnswer: shortAnswer
        });
        isCorrect = gradeResponse.data.isCorrect || false;
        explanation = gradeResponse.data.explanation || '';
      }

      setResult({
        isCorrect,
        explanation,
        studentAnswer: question.type === 'single-choice' ? selectedOption : shortAnswer,
        correctAnswer: question.type === 'single-choice' ? question.answer : null
      });

      // 如果回答错误，自动将知识点加入复习列表
      if (!isCorrect) {
        try {
          await apiClient.patch(`/knowledge-points/${id}/review-list`, { reviewList: true });
          console.log('知识点已标记为需复习');
        } catch (reviewError) {
          console.error('标记复习失败:', reviewError);
        }
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      setError('提交答案失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && !knowledgePoint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-600 font-semibold mb-4"
          >
            ← 返回主页
          </button>
          <h1 className="text-3xl font-bold text-gray-800">知识点测评</h1>
          <p className="text-gray-600 mt-2">{knowledgePoint?.title}</p>
        </div>

        {/* 难度选择 */}
        {!question && !result && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">选择难度和题型</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">题型：</label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      const difficulty = '中等';
                      fetchQuestion(difficulty, 'single-choice');
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    单选题 - 中等难度
                  </button>
                  <button
                    onClick={() => {
                      const difficulty = '中等';
                      fetchQuestion(difficulty, 'short-answer');
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    简答题 - 中等难度
                  </button>
                </div>
              </div>
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">自定义难度：</label>
                <div className="flex space-x-3">
                  {['基础', '中等', '困难'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => fetchQuestion(difficulty, 'single-choice')}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI生成题目中 */}
        {isGenerating && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
              <p className="text-gray-600 text-lg">AI正在出题中...</p>
            </div>
          </div>
        )}

        {/* 题目显示 */}
        {question && !result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {question.difficulty} | {question.type === 'single-choice' ? '单选题' : '简答题'}
              </span>
              {question.provider && (
                <span className="ml-2 text-xs text-gray-500">服务提供方: {question.provider}</span>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <h3 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h3>

              {question.type === 'single-choice' ? (
                // 单选题选项
                <div className="space-y-3 mb-6">
                  {Object.entries(question.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedOption === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="option"
                        value={key}
                        checked={selectedOption === key}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-3 w-5 h-5 text-blue-600"
                      />
                      <span className="text-gray-800">{key}. {value}</span>
                    </label>
                  ))}
                </div>
              ) : (
                // 简答题输入框
                <div className="mb-6">
                  <textarea
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请在此输入你的答案..."
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? '提交中...' : '提交答案'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuestion(null);
                    setResult(null);
                    setSelectedOption('');
                    setShortAnswer('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  重新选择
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 测评结果 */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">测评结果</h2>

            <div className={`text-center p-6 mb-6 rounded-lg ${
              result.isCorrect ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
            }`}>
              <p className={`text-3xl font-bold mb-2 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {result.isCorrect ? '✓ 回答正确！' : '✗ 回答错误！'}
              </p>
              {question.type === 'single-choice' && (
                <p className="text-gray-700 mt-2">
                  你的答案: <span className="font-bold">{result.studentAnswer}</span> | 
                  正确答案: <span className="font-bold text-green-600">{result.correctAnswer}</span>
                </p>
              )}
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">详细解释：</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                {result.explanation}
              </div>
            </div>

            {!result.isCorrect && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 font-semibold">
                  ⚠️ 该知识点已加入你的复习列表，建议重新学习后再测试。
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setResult(null);
                  setSelectedOption('');
                  setShortAnswer('');
                  fetchQuestion(question.difficulty, question.type);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                再来一题（同难度）
              </button>
              <button
                onClick={() => {
                  setQuestion(null);
                  setResult(null);
                  setSelectedOption('');
                  setShortAnswer('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                重新选择难度
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                返回主页
              </button>
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;


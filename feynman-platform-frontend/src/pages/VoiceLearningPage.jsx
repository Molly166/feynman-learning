// src/pages/VoiceLearningPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import AudioRecorder from '../components/AudioRecorder';

export default function VoiceLearningPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [knowledgePoint, setKnowledgePoint] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  React.useEffect(() => {
    if (id) {
      fetchKnowledgePoint();
    }
  }, [id]);

  const fetchKnowledgePoint = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/knowledge-points/${id}`);
      setKnowledgePoint(response.data);
    } catch (error) {
      console.error('Error fetching knowledge point:', error);
      setError('获取知识点失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscription = async (text) => {
    setTranscription(text);
    setAiFeedback(null);
    
    // 自动触发AI评估
    if (text && knowledgePoint) {
      await getAiEvaluation(text);
    }
  };

  // 获取AI评估
  const getAiEvaluation = async (transcribedText) => {
    if (!knowledgePoint || !transcribedText.trim()) {
      return;
    }

    setIsEvaluating(true);
    setError('');

    try {
      const feedbackResponse = await apiClient.post('/ai/evaluate-feynman', {
        originalContent: knowledgePoint.content,
        transcribedText: transcribedText,
        knowledgePoint: knowledgePoint.title
      });

      setAiFeedback(feedbackResponse.data);

      // 如果评分低于60分，自动标记为需复习
      const overallScore = feedbackResponse.data.overallScore || feedbackResponse.data.accuracy || 0;
      if (overallScore < 60) {
        try {
          await apiClient.patch(`/knowledge-points/${id}/review-list`, { reviewList: true });
          console.log('知识点已标记为需复习');
        } catch (reviewError) {
          console.error('标记复习失败:', reviewError);
        }
      }
    } catch (error) {
      console.error('获取AI评价失败', error);
      setError('AI评估失败，请稍后重试');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  const saveTranscription = async () => {
    if (!transcription.trim()) {
      setError('请先进行语音转录');
      return;
    }

    try {
      // 这里可以将转录结果保存到知识点中，或者创建学习记录
      console.log('保存转录结果:', transcription);
      // 可以添加保存逻辑
      alert('转录结果已保存！');
    } catch (error) {
      console.error('Error saving transcription:', error);
      setError('保存失败');
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-600 font-semibold mb-4"
          >
            ← 返回主页
          </button>
          <h1 className="text-3xl font-bold text-gray-800">语音学习</h1>
          <p className="text-gray-600 mt-2">使用费曼技巧，通过语音复述来加深理解</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 知识点内容 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {knowledgePoint?.title || '知识点内容'}
            </h2>
            <div className="prose max-w-none prose-headings:text-gray-800 prose-p:text-gray-700">
              {knowledgePoint?.content ? (
                <div dangerouslySetInnerHTML={{ __html: knowledgePoint.content }} />
              ) : (
                <div className="text-gray-500 italic">
                  请选择一个知识点进行语音学习
                </div>
              )}
            </div>
          </div>

          {/* 语音转录区域 */}
          <div className="space-y-6">
            <AudioRecorder
              onTranscription={handleTranscription}
              onError={handleError}
            />

            {/* 转录结果显示 */}
            {transcription && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">转录结果</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{transcription}</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setTranscription('');
                      setAiFeedback(null);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    清除
                  </button>
                  <button
                    onClick={() => getAiEvaluation(transcription)}
                    disabled={isEvaluating}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    {isEvaluating ? 'AI评估中...' : '重新评估'}
                  </button>
                </div>
              </div>
            )}

            {/* AI评估反馈 */}
            {isEvaluating && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
                  <p className="text-gray-600 text-lg">AI教练正在批阅您的答卷...</p>
                </div>
              </div>
            )}

            {aiFeedback && !isEvaluating && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">AI 教练反馈</h3>
                  {aiFeedback.provider && (
                    <span className="text-xs text-gray-500">服务提供方: {aiFeedback.provider}</span>
                  )}
                </div>

                {/* 综合得分 */}
                {aiFeedback.overallScore !== undefined && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-4 text-center">
                    <div className="text-sm text-gray-600 mb-2">综合得分</div>
                    <div className={`text-5xl font-bold ${aiFeedback.overallScore >= 80 ? 'text-green-600' : aiFeedback.overallScore >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                      {aiFeedback.overallScore}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">满分 100 分</div>
                  </div>
                )}

                {/* 分项得分 */}
                {(aiFeedback.accuracy !== undefined || aiFeedback.completeness !== undefined || aiFeedback.expression !== undefined) && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {aiFeedback.accuracy !== undefined && (
                      <div className="text-center bg-blue-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-700">{aiFeedback.accuracy}</div>
                        <div className="text-xs text-gray-600 mt-1">准确性</div>
                      </div>
                    )}
                    {aiFeedback.completeness !== undefined && (
                      <div className="text-center bg-purple-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-700">{aiFeedback.completeness}</div>
                        <div className="text-xs text-gray-600 mt-1">完整性</div>
                      </div>
                    )}
                    {aiFeedback.expression !== undefined && (
                      <div className="text-center bg-green-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-700">{aiFeedback.expression}</div>
                        <div className="text-xs text-gray-600 mt-1">表达</div>
                      </div>
                    )}
                  </div>
                )}

                {/* 润色后的文本 */}
                {aiFeedback.polishedText && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-blue-700 mb-2">AI 润色后的文本</h4>
                    <div className="bg-blue-50 rounded-lg p-4 text-gray-900 whitespace-pre-wrap border border-blue-200">
                      {aiFeedback.polishedText}
                    </div>
                  </div>
                )}

                {/* 综合评价 */}
                {aiFeedback.evaluation && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">综合评价</h4>
                    <div className="bg-yellow-50 rounded-lg p-4 text-gray-800 whitespace-pre-line border border-yellow-200">
                      {aiFeedback.evaluation}
                    </div>
                  </div>
                )}

                {/* 优点 */}
                {Array.isArray(aiFeedback.strengths) && aiFeedback.strengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-700 mb-2">优点 👍</h4>
                    <ul className="list-disc list-inside space-y-1 bg-green-50 rounded-lg p-4 border border-green-200">
                      {aiFeedback.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-800">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 待改进 */}
                {Array.isArray(aiFeedback.weaknesses) && aiFeedback.weaknesses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-700 mb-2">待改进 👇</h4>
                    <ul className="list-disc list-inside space-y-1 bg-red-50 rounded-lg p-4 border border-red-200">
                      {aiFeedback.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-gray-800">{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 学习提示 */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">费曼学习法提示</h3>
          <ul className="text-blue-700 space-y-2">
            <li>• 仔细阅读知识点内容，确保理解核心概念</li>
            <li>• 用自己的话复述知识点，就像在教别人一样</li>
            <li>• 如果复述不清楚，说明理解不够深入，需要重新学习</li>
            <li>• 录音时保持清晰、缓慢的语速</li>
            <li>• 转录后检查内容，看是否准确表达了知识点</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

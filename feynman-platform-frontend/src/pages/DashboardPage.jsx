// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [knowledgePoints, setKnowledgePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setKnowledgePoints([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const fetchKnowledgePoints = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/knowledge-points', {
          signal: controller.signal,
        });
        setKnowledgePoints(response.data);
        setError('');
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err?.response?.status === 401 ? '登录已过期，请重新登录' : '获取知识点失败');
        console.error(err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchKnowledgePoints();

    return () => controller.abort();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('你确定要删除这个知识点吗？')) {
      try {
        await apiClient.delete(`/knowledge-points/${id}`);
        setKnowledgePoints(knowledgePoints.filter(kp => kp._id !== id));
      } catch (error) {
        console.error('删除失败', error);
      }
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">加载中...</div>;
  }

  if (!user) {
    // 不再在DashboardPage展示广告页，未登录将由路由直接重定向
    return null;
  }

  // AI润色/评价功能区块
  function AIBlock() {
    const [tab, setTab] = useState('polish');
    const [text, setText] = useState('');
    const [style, setStyle] = useState('concise');
    const [result, setResult] = useState(null); // 用对象保存解析后的数据
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // 新增props: 传递当前知识点id（假如需要）
    // const kpId = ... （根据集成环境可补）

    const runPolish = async () => {
      setLoading(true); setError(''); setResult(null);
      try {
        const res = await apiClient.post('/ai/polish', { text, style });
        setResult({ polishedText: res.data.result, provider: res.data.provider });
      } catch (e) {
        setError('润色失败，请稍后重试');
      } finally { setLoading(false); }
    };

    const runEvaluate = async () => {
      setLoading(true); setError(''); setResult(null);
      try {
        const res = await apiClient.post('/ai/evaluate', { text });
        // 新的API直接返回JSON对象
        const feedback = res.data;
        setResult(feedback);
      } catch (e) {
        setError('评价失败，请稍后重试');
      } finally { setLoading(false); }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-3">AI 文本润色与智能评价</h2>
        <div className="flex space-x-2 mb-2">
          <button onClick={() => setTab('polish')} className={`px-4 py-1 rounded ${tab==='polish'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}>润色</button>
          <button onClick={() => setTab('evaluate')} className={`px-4 py-1 rounded ${tab==='evaluate'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}>评价</button>
        </div>
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="在这里输入需要润色或评价的文本"
          />
          {tab === 'polish' && (
            <div className="flex items-center space-x-3">
              <label className="text-gray-600">风格：</label>
              <select value={style} onChange={(e)=>setStyle(e.target.value)} className="border border-gray-300 rounded-lg p-1">
                <option value="concise">简洁</option>
                <option value="formal">正式</option>
                <option value="academic">学术</option>
                <option value="friendly">亲切</option>
              </select>
            </div>
          )}
          <div className="flex space-x-3">
            {tab==='polish' ? (
              <button onClick={runPolish} disabled={loading || !text.trim()} className="bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded-lg">{loading?'处理中...':'开始润色'}</button>
            ) : (
              <button onClick={runEvaluate} disabled={loading || !text.trim()} className="bg-blue-600 disabled:bg-blue-300 text-white px-3 py-1 rounded-lg">{loading?'处理中...':'开始评价'}</button>
            )}
            <button onClick={()=>{setText('');setResult(null);setError('');}} className="bg-gray-500 text-white px-3 py-1 rounded-lg">清空</button>
          </div>
          {error && <div className="text-red-600">{error}</div>}
          {loading && <div className="text-blue-600">AI 正在处理，请稍候...</div>}
          {result && (
            <div className="space-y-3 mt-3">
              {result.polishedText && (
                <div>
                  <h3 className="font-semibold text-blue-700 mb-1">AI 润色文本</h3>
                  <div className="bg-blue-50 px-4 py-2 rounded text-gray-900 whitespace-pre-wrap">{result.polishedText}</div>
                </div>
              )}
              {(typeof result.accuracy === 'number' || typeof result.completeness === 'number' || typeof result.expression === 'number') && (
                <div className="flex space-x-6">
                  <div className="text-center"><span className="text-2xl font-bold text-blue-800">{result.accuracy ?? '-'}</span><div className="text-xs text-gray-500">准确性</div></div>
                  <div className="text-center"><span className="text-2xl font-bold text-blue-800">{result.completeness ?? '-'}</span><div className="text-xs text-gray-500">完整性</div></div>
                  <div className="text-center"><span className="text-2xl font-bold text-blue-800">{result.expression ?? '-'}</span><div className="text-xs text-gray-500">表达</div></div>
                </div>
              )}
              {result.evaluation && (
                <div>
                  <h3 className="font-semibold text-blue-700">综合评价</h3>
                  <div className="bg-yellow-50 px-4 py-2 rounded text-gray-800 whitespace-pre-line">{result.evaluation}</div>
                </div>
              )}
              {Array.isArray(result.strengths) && result.strengths.length > 0 && (
                <div>
                  <h4 className="text-green-700 font-medium">优点</h4>
                  <ul className="list-disc ml-6 text-green-700 text-sm">
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {Array.isArray(result.weaknesses) && result.weaknesses.length > 0 && (
                <div>
                  <h4 className="text-red-700 font-medium">问题/建议</h4>
                  <ul className="list-disc ml-6 text-red-700 text-sm">
                    {result.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) return <p>加载中...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="min-h-screen">
      {/* 头部和广告区下方，插入AI功能块 */}
      <AIBlock />
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl mb-8">
        <div className="px-8 py-12 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            {t('Knowledge Points')}
          </h1>
          <p className="text-lg md:text-xl mb-6 text-blue-100">
            用费曼技巧让学习更高效，让知识更深入
          </p>
          <Link 
            to="/kp/new"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-full font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            + {t('New Knowledge Point')}
          </Link>
        </div>
      </div>
      {/* Knowledge Points List */}
      <div className="space-y-6">
        {knowledgePoints.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有知识点</h3>
            <p className="text-gray-500 mb-4">你还没有任何知识点，快去创建一个吧！</p>
          </div>
        ) : (
          knowledgePoints.map((kp) => (
            <div key={kp._id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300${kp.reviewList ? ' border-2 border-red-600 ring-2 ring-red-300' : ''}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    {kp.title}
                    {kp.reviewList && <span title="需复习" className="ml-3 inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>}
                  </h2>
                  <div className="flex space-x-2 flex-wrap gap-2">
                    <Link 
                      to={`/quiz/${kp._id}`}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold"
                    >
                      开始测评
                    </Link>
                    <Link 
                      to={`/voice-learning/${kp._id}`}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      {t('Voice Learning')}
                    </Link>
                    <Link 
                      to={`/kp/edit/${kp._id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      {t('Edit Knowledge Point')}
                    </Link>
                    <button 
                      onClick={() => handleDelete(kp._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      {t('Delete')}
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    kp.status === 'in_progress' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : kp.status === 'mastered' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {t('Status')}: {kp.status === 'in_progress' ? '学习中' : kp.status === 'mastered' ? '已掌握' : '待学习'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{__html: kp.content}} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
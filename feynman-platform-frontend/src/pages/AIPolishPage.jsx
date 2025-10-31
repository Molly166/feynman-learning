import { useState } from 'react';
import apiClient from '../api/axios';

export default function AIPolishPage() {
  const [tab, setTab] = useState('polish');
  const [text, setText] = useState('');
  const [style, setStyle] = useState('concise');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runPolish = async () => {
    setLoading(true); setError(''); setResult('');
    try {
      const res = await apiClient.post('/ai/polish', { text, style });
      setResult(res.data.result || '');
    } catch (e) {
      setError('润色失败，请稍后重试');
    } finally { setLoading(false); }
  };

  const runEvaluate = async () => {
    setLoading(true); setError(''); setResult('');
    try {
      const res = await apiClient.post('/ai/evaluate', { text });
      const data = res.data.result;
      setResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } catch (e) {
      setError('评价失败，请稍后重试');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">AI 文本润色与智能评价</h1>

        <div className="flex space-x-2 mb-4">
          <button onClick={() => setTab('polish')} className={`px-4 py-2 rounded ${tab==='polish'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}>润色</button>
          <button onClick={() => setTab('evaluate')} className={`px-4 py-2 rounded ${tab==='evaluate'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}>评价</button>
        </div>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="在这里输入需要润色或评价的文本"
          />

          {tab === 'polish' && (
            <div className="flex items-center space-x-3">
              <label className="text-gray-600">风格：</label>
              <select value={style} onChange={(e)=>setStyle(e.target.value)} className="border border-gray-300 rounded-lg p-2">
                <option value="concise">简洁</option>
                <option value="formal">正式</option>
                <option value="academic">学术</option>
                <option value="friendly">亲切</option>
              </select>
            </div>
          )}

          <div className="flex space-x-3">
            {tab==='polish' ? (
              <button onClick={runPolish} disabled={loading || !text.trim()} className="bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg">{loading?'处理中...':'开始润色'}</button>
            ) : (
              <button onClick={runEvaluate} disabled={loading || !text.trim()} className="bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg">{loading?'处理中...':'开始评价'}</button>
            )}
            <button onClick={()=>{setText('');setResult('');setError('');}} className="bg-gray-500 text-white px-4 py-2 rounded-lg">清空</button>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          {result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



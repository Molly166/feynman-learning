// src/pages/KnowledgePointFormPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function KnowledgePointFormPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('not_started');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing) {
      const fetchKp = async () => {
        try {
          const response = await apiClient.get(`/knowledge-points/${id}`);
          setTitle(response.data.title);
          setContent(response.data.content);
          setStatus(response.data.status);
        } catch (error) {
          console.error('获取知识点失败', error);
          setError('获取知识点失败');
        }
      };
      fetchKp();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const kpData = { title, content, status };
      if (isEditing) {
        await apiClient.put(`/knowledge-points/${id}`, kpData);
      } else {
        await apiClient.post('/knowledge-points', kpData);
      }
      navigate('/');
    } catch (error) {
      console.error('保存知识点失败', error);
      setError('保存失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            {isEditing ? '编辑知识点' : '新建知识点'}
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入知识点标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="not_started">待学习</option>
                <option value="in_progress">学习中</option>
                <option value="mastered">已掌握</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容
              </label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                style={{ minHeight: 200 }}
                placeholder="请输入知识点内容，支持丰富格式、图片、列表、代码块等"
              />
              <p className="text-sm text-gray-500 mt-2">支持图文混排、列表、代码块、数学公式等丰富格式</p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                disabled={loading}
              >取消</button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                disabled={loading}
              >{loading ? '保存中...' : '保存'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default KnowledgePointFormPage;

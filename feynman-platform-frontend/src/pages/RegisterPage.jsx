// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from "react";
import apiClient from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // 预填从登录页带过来的 email（如果有）
    const stateEmail = location.state?.email;
    if (stateEmail) {
      setFormData(prev => ({ ...prev, email: stateEmail }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const response = await apiClient.post('/users/register', formData);
      // 注册成功后自动登录并进入首页
      if (response.data?.token) {
        login(response.data.token);
        navigate('/');
      } else {
        // 兜底：没有返回 token 时，退回登录页
        navigate('/login');
      }
    } catch (err) {
      console.error('注册失败:', err.response.data);
      setError(err.response.data.msg || '注册失败，请稍后再试');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">注册</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">用户名</label>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="请输入用户名"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">邮箱</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="请输入邮箱"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">密码</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="请输入密码"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            注册
          </button>
        </form>

        {error && <p style={{ color: 'red' }} className="mt-4 text-center">{error}</p>}

        <p className="text-sm text-center text-gray-500 mt-4">
          已有账号？ <a href="/login" className="text-green-500 hover:underline">登录</a>
        </p>
      </div>
    </div>
  );
}
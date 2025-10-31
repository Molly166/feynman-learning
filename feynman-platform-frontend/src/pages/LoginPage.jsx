// src/pages/LoginPage.jsx
import React, { useState } from "react";
import apiClient from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
        const response = await apiClient.post('/users/login', { email, password });
      login(response.data.token);
      navigate('/');
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.msg;
      console.error('登录失败:', err?.response?.data || err?.message);
      // 凭证无效：引导去注册，预填 email
      if (status === 400 && msg === 'Invalid Credentials') {
        navigate('/register', { state: { email } });
        return;
      }
      setError(msg || '登录失败，请稍后再试');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800">登录</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-600">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="请输入邮箱"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="请输入密码"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            登录
          </button>
        </form>

        {error && <p style={{ color: 'red' }} className="mt-4 text-center">{error}</p>}

        <p className="text-sm text-center text-gray-500">
          没有账号？ <a href="/register" className="text-blue-500 hover:underline">注册</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
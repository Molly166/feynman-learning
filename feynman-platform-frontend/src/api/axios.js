// src/api/axios.js
import axios from 'axios';

const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.__APP_API_BASE__) {
        return window.__APP_API_BASE__;
    }
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
};

const apiClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// 添加一个请求拦截器
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // 从localStorage获取token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // 用Authorization标准头
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
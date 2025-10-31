// src/api/axios.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // 后端API的基础路径
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
// src/components/Layout.jsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const location = useLocation();
  const { i18n } = useTranslation();
  
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">F</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                费曼学习平台
              </h1>
            </div>
            <nav className="flex space-x-6">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'hover:bg-blue-500 hover:shadow-md'
                }`}
              >
                主页
              </Link>
              <Link 
                to="/login" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/login') 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'hover:bg-blue-500 hover:shadow-md'
                }`}
              >
                登录
              </Link>
              <Link 
                to="/register" 
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive('/register') 
                    ? 'bg-white text-blue-600 shadow-md' 
                    : 'hover:bg-blue-500 hover:shadow-md'
                }`}
              >
                注册
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 页面主体：使用 Outlet 来渲染子路由 */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg font-semibold">费曼学习平台</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 费曼学习平台 - 让学习更高效，让知识更深入
          </p>
        </div>
      </footer>
    </div>
  );
}
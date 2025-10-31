import React from 'react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-white">
      {/* 广告区动感渐变背景，只在广告内容区内 */}
      <div className="absolute inset-0 z-0 pointer-events-none animate-gradient-x bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 opacity-80 blur-lg" style={{backgroundSize:'200% 200%'}} />
      {/* 广告内容卡片 */}
      <div className="relative z-20 max-w-xl p-10 bg-white bg-opacity-90 rounded-3xl shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-4">Feynman 学习平台</h1>
        <p className="mb-6 text-xl text-gray-600">AI驱动的个人高效学习与知识管理工具</p>
        <ul className="text-left mb-6 text-gray-800 space-y-2 list-disc list-inside">
          <li>🧠 便捷的知识点管理与自定义标签</li>
          <li>🎤 原创语音学习与AI语音转文本功能</li>
          <li>📝 所见即所得的富文本编辑</li>
          <li>🤖 智能文本润色与AI自动评价</li>
          <li>🌏 多语言支持，中/英文界面自由切换</li>
          <li>🔒 完善的权限系统与隐私保护</li>
        </ul>
        <a href="/register" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-purple-600 hover:to-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-xl transition hover:scale-105">
          立即注册，开启AI高效学习
        </a>
        <div className="mt-6 text-gray-400 text-sm">已注册用户请直接登录体验全部功能</div>
      </div>
      <style>{`
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x-move 8s ease-in-out infinite;
        }
        @keyframes gradient-x-move {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
      `}</style>
    </div>
  );
}

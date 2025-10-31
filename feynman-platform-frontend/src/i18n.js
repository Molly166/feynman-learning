import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zh: {
    translation: {
      'Login': '登录',
      'Register': '注册',
      'Logout': '退出登录',
      'Username': '用户名',
      'Password': '密码',
      'Dashboard': '主页',
      'Knowledge Points': '知识点',
      'New Knowledge Point': '新建知识点',
      'Edit Knowledge Point': '编辑知识点',
      'Status': '状态',
      'Content': '内容',
      'Save': '保存',
      'Cancel': '取消',
      'Confirm': '确认',
      'Delete': '删除',
      'Voice Learning': '语音学习',
      'AI Polish/Evaluate': 'AI文本润色与智能评价',
      'Language': '语言',
    }
  },
  en: {
    translation: {
      'Login': 'Login',
      'Register': 'Register',
      'Logout': 'Logout',
      'Username': 'Username',
      'Password': 'Password',
      'Dashboard': 'Dashboard',
      'Knowledge Points': 'Knowledge Points',
      'New Knowledge Point': 'New Knowledge Point',
      'Edit Knowledge Point': 'Edit Knowledge Point',
      'Status': 'Status',
      'Content': 'Content',
      'Save': 'Save',
      'Cancel': 'Cancel',
      'Confirm': 'Confirm',
      'Delete': 'Delete',
      'Voice Learning': 'Voice Learning',
      'AI Polish/Evaluate': 'AI Polish/Evaluate',
      'Language': 'Language',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zh',
    fallbackLng: 'zh',
    interpolation: { escapeValue: false }
  });

export default i18n;

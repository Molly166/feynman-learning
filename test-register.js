const axios = require('axios');

async function testRegister() {
  try {
    console.log('测试注册API...');
    
    const response = await axios.post('http://localhost:3000/api/users/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: '123456'
    });
    
    console.log('✅ 注册成功:', response.data);
  } catch (error) {
    console.error('❌ 注册失败:');
    console.error('状态码:', error.response?.status);
    console.error('错误信息:', error.response?.data);
    console.error('完整错误:', error.message);
  }
}

// 等待2秒让服务器启动
setTimeout(testRegister, 2000);















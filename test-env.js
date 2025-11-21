// 测试环境变量加载
require('dotenv').config({ path: './.env' });

console.log('=== 环境变量测试 ===');
console.log('QIANFAN_API_KEY:', process.env.QIANFAN_API_KEY ? `已设置 (长度: ${process.env.QIANFAN_API_KEY.length})` : '未设置');
console.log('QIANFAN_SECRET_KEY:', process.env.QIANFAN_SECRET_KEY ? `已设置 (长度: ${process.env.QIANFAN_SECRET_KEY.length})` : '未设置');
console.log('PORT:', process.env.PORT || '未设置');
console.log('MONGO_URI:', process.env.MONGO_URI ? '已设置' : '未设置');

if (process.env.QIANFAN_API_KEY && process.env.QIANFAN_SECRET_KEY) {
    console.log('\n✅ 环境变量配置正确！');
} else {
    console.log('\n❌ 环境变量配置不完整！');
    console.log('请检查 .env 文件中的配置。');
}


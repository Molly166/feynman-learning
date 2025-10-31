// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 支持 Authorization: Bearer <token> 标准写法以及 x-auth-token 兼容老接口
  let token =
    req.header('Authorization')?.replace(/^Bearer\s+/i, '').trim() ||
    req.header('x-auth-token') ||
    '';

  if (!token) {
    return res.status(401).json({ msg: '无token，授权被拒绝' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'token无效' });
  }
};
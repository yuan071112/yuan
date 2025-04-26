const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 验证JWT token
const auth = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findOne({ _id: decoded.user.id });

    if (!user) {
      throw new Error();
    }

    // 将用户和token添加到请求对象
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ error: '请先登录' });
  }
};

// 检查用户角色
const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ error: '无权访问' });
    }
    next();
  };
};

module.exports = {
  auth,
  roleAuth
};

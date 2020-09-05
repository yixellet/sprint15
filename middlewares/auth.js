const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const secretKey = require('../secretKey');
const MustAuthorizeError = require('../errors/must-authorize-error');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    const err = new MustAuthorizeError('Необходима авторизация');
    next(err);
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : secretKey.secretKey);
  } catch (e) {
    const err = new MustAuthorizeError('Необходима авторизация');
    next(err);
  }
  req.user = payload;
  next();
};

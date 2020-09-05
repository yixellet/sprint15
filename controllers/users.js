const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secretKey = require('../secretKey');
const NotFoundError = require('../errors/not-found-error');
const ServerError = require('../errors/server-error');
const UserExistsError = require('../errors/user-exists-error');
const PasswordSymbolsError = require('../errors/password-symbols-error');

function createUserError(req, res, err) {
  if (err.code === 11000) {
    return new UserExistsError('Пользователь с таким Email уже существует');
  }
  return new ServerError('На сервере произошла ошибка');
}

function passwordValidation(password) {
  const regex = /[A-Za-z0-9]{8,}/;
  return regex.test(password);
}

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((e) => {
      const err = new ServerError('На сервере произошла ошибка');
      next(err);
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователя с таким ID не существует');
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;
  if (passwordValidation(req.body.password)) {
    bcrypt.hash(req.body.password, 10)
      .then((hash) => User.create({
        name, about, avatar, email, password: hash,
      }))
      .then((user) => res.send({
        id: user._id, about: user.about, avatar: user.avatar, email: user.email,
      }))
      .catch((err) => createUserError(req, res, err));
  } else {
    const err = new PasswordSymbolsError('Пароль должен содержать не менее 8 символов и состоять из цифр и латинских букв');
    next(err);
  }
};

module.exports.updateUser = (req, res, next) => {
  const newName = req.body.name;
  const newAbout = req.body.about;
  User.findByIdAndUpdate(req.user._id,
    { name: newName, about: newAbout },
    { new: true, runValidators: true, upsert: false })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователя с таким ID не существует');
      }
    })
    .catch(next);
};

module.exports.updateAvatar = (req, res, next) => {
  const newAvatar = req.body.avatar;
  User.findByIdAndUpdate(req.user._id,
    { avatar: newAvatar },
    { new: true, runValidators: true, upsert: true })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        throw new NotFoundError('Пользователя с таким ID не существует');
      }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : secretKey.secretKey, { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
        .end();
    })
    .catch((e) => {
      const err = new NotFoundError('Пользователь не найден');
      next(err);
    });
};

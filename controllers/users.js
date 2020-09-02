const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secretKey = require('../secretKey');

function error(res) {
  res.status(404).send({ message: 'Пользователя с таким ID не существует' });
}

function createUserError(req, res, err) {
  if (err.code === 11000) {
    return res.status(409).send({ message: 'Пользователь с таким Email уже существует' });
  }
  return res.status(500).send({ message: err.message });
}

function passwordValidation(password) {
  const regex = /[A-Za-z0-9]{8,}/;
  return regex.test(password);
}

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        error(res);
      }
    })
    .catch(() => error(res));
};

module.exports.createUser = (req, res) => {
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
    res.status(400).send({ message: 'Пароль должен содержать не менее 8 символов и состоять из цифр и латинских букв' });
  }
};

module.exports.updateUser = (req, res) => {
  const newName = req.body.name;
  const newAbout = req.body.about;
  User.findByIdAndUpdate(req.user._id,
    { name: newName, about: newAbout },
    { new: true, runValidators: true, upsert: false })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        error(res);
      }
    })
    .catch(() => error(res));
};

module.exports.updateAvatar = (req, res) => {
  const newAvatar = req.body.avatar;
  User.findByIdAndUpdate(req.user._id,
    { avatar: newAvatar },
    { new: true, runValidators: true, upsert: true })
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        error(res);
      }
    })
    .catch(() => error(res));
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, secretKey.secretKey, { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 3600000, httpOnly: true })
        .end();
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, getUserById, updateUser, updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex(),
  }).unknown(true),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }).unknown(true),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(new RegExp('^https?:\/\/(www\.)?([\w-]+\.[a-z]+|(\d{1,3}\.){3}\d{1,3})((:[0])|(:[1-9]{1}([\d]{1,4})?))?((\/[\w-]{1,}#?){1,})?(\/)?')),
  }).unknown(true),
}), updateAvatar);

module.exports = router;

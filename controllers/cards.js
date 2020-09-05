const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');
const CantDeleteError = require('../errors/cant-delete-error');
const ServerError = require('../errors/server-error');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((e) => {
      const err = new ServerError('На сервере произошла ошибка');
      next(err);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((e) => {
      const err = new ServerError('На сервере произошла ошибка');
      next(err);
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (String(card.owner) === String(req.user._id)) {
        Card.findByIdAndRemove(card._id)
          .then((cardo) => {
            if (cardo) {
              res.send({ data: cardo });
            } else {
              throw new NotFoundError('Карточки с таким ID не существует');
            }
          })
          .catch(next);
      } else {
        throw new CantDeleteError('Удалять карточки может только их владелец');
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.send({ data: card });
      } else {
        throw new NotFoundError('Карточки с таким ID не существует');
      }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.send({ data: card });
      } else {
        throw new NotFoundError('Карточки с таким ID не существует');
      }
    })
    .catch(next);
};

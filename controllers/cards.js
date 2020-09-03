const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-error');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.deleteCard = (req, res) => {
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
        res.status(403).send({ message: 'Удалять карточки может только их владелец' });
      }
    })
    .catch(next);
};

module.exports.likeCard = (req, res) => {
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

module.exports.dislikeCard = (req, res) => {
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

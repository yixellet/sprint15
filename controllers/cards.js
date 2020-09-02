const Card = require('../models/card');

function error(res) {
  res.status(404).send({ message: 'Отсутствует карточка с таким ID' });
}

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
              error(res);
            }
          })
          .catch(() => error(res));
      } else {
        res.status(403).send({ message: 'Удалять карточки может только их владелец' });
      }
    })
    .catch(() => error(res));
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.send({ data: card });
      } else {
        error(res);
      }
    })
    .catch(() => error(res));
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) {
        res.send({ data: card });
      } else {
        error(res);
      }
    })
    .catch(() => error(res));
};

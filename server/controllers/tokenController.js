const { validatePassword } = require('../lib/user.js');

const {
  createToken,
  removeToken,
  extendToken,
  getTokenById,
} = require('../lib/token');
const { sanitize } = require('../utils');

const tokenController = {};

/**
 * Handler for creating user
 */
tokenController.postToken = (req, res, next) => {
  const username = sanitize(req.body.username, 'string', 6);
  const password = sanitize(req.body.password, 'string', 6);
  validatePassword(username, password)
    .then((userId) => {
      createToken(userId)
        .then((data) => {
          res.status(200).json(data).end();
        }).catch(next);
    }).catch((err) => {
      res.status(403).json({ Error: 'Could not validate the password' }).end();
      next(err);
    });
};

/**
 * Handler for returning one user
 */
tokenController.getToken = (req, res, next) => {
  const { id } = req.params;
  getTokenById(id)
    .then((token) => {
      if (!token) {
        res.status(404).end();
      }
      return res.status(200).json(token).end();
    }).catch(next);
};

/**
 * Handler for changing password
 */
tokenController.deleteToken = (req, res, next) => {
  const { id } = req.params;
  getTokenById(id)
    .then((token) => {
      if (!token) {
        res.status(404).end();
      }
    })
    .then(() => removeToken(id))
    .then(() => {
      res.status(200).end();
    })
    .catch(next);
};

/**
 * Handler for extending token
 */
tokenController.putToken = (req, res, next) => {
  const { id } = req.params;
  getTokenById(id)
    .then((token) => {
      if (!token) {
        res.status(404).end();
      }
    })
    .then(() => extendToken(id))
    .then(() => {
      res.status(200).end();
    })
    .catch(next);
};

// Export the controller
module.exports = tokenController;

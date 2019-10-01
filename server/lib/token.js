/**
 * Handler for token related routes
 */

// Require dependencies
const uuid = require('uuid/v4');

const {
  dbCreate, dbRead, dbRemove, dbUpdate, dbReadSelectors,
} = require('../db');
const { sanitize } = require('../utils');
const { getUserById } = require('./user');

// create user handler object
const tokenHandler = {};

/**
 * function for returning token by id
 *
 * @param string id
 * @param function callback(err, status, data)
 */
const getTokenById = (id) => {
  if (!id) {
    return Promise.reject(new Error('Missing required values'));
  }

  return dbRead('tokens', id, ['id', 'username', 'user_id', 'expires'])
    .then((res) => res.rows[0]);
};

/**
 * Handler for creating token
 *
 * @param object data, an object containing user data
 */
tokenHandler.createToken = (userId) => {
  const id = uuid();
  const expires = Date.now() + 60 * 60 * 1000;
  return getUserById(userId)
    .then((user) => dbCreate('tokens', {
      username: user.username, id, expires, user_id: user.id,
    }))
    .then(() => getTokenById(id));
};

/**
 * Handler for changing password
 *
 * @param object data, an object containing user data
 */
tokenHandler.extendToken = (id, time = 3600000) => {
  const expires = Date.now() + time;
  return dbUpdate('tokens', id, { expires });
};

/**
 * Handler for deleting password
 *
 * @param object data, an object containing user data
 */
tokenHandler.removeToken = (id) => dbRemove('tokens', id);

/**
 * function for verifying the token is valid
 *
 * @param String id
 * @param String username
 */
const verifyToken = (id, user) => {
  const username = sanitize(user, 'string', 6);
  return dbReadSelectors('tokens', { id, username })
    .then((res) => res.rows[0])
    .then((token) => {
      if (!token) {
        return Promise.reject(new Error('Token not Found'));
      }
      if (token.expires < Date.now()) {
        return Promise.reject(new Error('Token already expired'));
      }
      return Promise.resolve();
    });
};

const authenticate = (req, res, next) => {
  const requestToken = req.headers.token;
  if (!requestToken) {
    return res.status(403).json({ Error: 'Token not provided' }).end();
  }
  return getTokenById(requestToken)
    .then((token) => {
      if (!token) {
        return res.status(403).json({ Error: 'Token doesnot exists!' }).end();
      }
      return verifyToken(requestToken, token.username)
        .then(() => {
          req.user = token.username;
          req.user_id = token.user_id;
          next();
        }).catch((err) => {
          res.status(403).json({ Error: err }).end();
        });
    }).catch(() => {
      res.status(500).json({ Error: 'Could not validate the token' }).end();
    });
};

// Add local functions for export
tokenHandler.verifyToken = verifyToken;
tokenHandler.getTokenById = getTokenById;
tokenHandler.authenticate = authenticate;

// Export the controller
module.exports = tokenHandler;

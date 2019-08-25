/**
 * Handler for token related routes
 */

// Require dependencies
const uuid = require('uuid/v4');

const {
  dbCreate, dbRead, dbRemove, dbUpdate, dbReadSelectors,
} = require('../db');
const { sanitize } = require('../utils');
const { validatePassword, getUserByUsername, getUserById } = require('../handlers/userHandler');

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
    .then(res => res.rows[0]);
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
  .then(user => dbCreate('tokens', {
    username: user.username, id, expires, user_id: user.id
  }))
  .then(() => getTokenById(id))
};

/**
 * Handler for changing password
 *
 * @param object data, an object containing user data
 */
tokenHandler.extendToken = (id, time = 3600000) => {
  const expires = Date.now() + time;
  return dbUpdate('tokens', id, { expires })
};

/**
 * Handler for deleting password
 *
 * @param object data, an object containing user data
 */
tokenHandler.removeToken = (id) => {
  return dbRemove('tokens', id)
};

/**
 * function for verifying the token is valid
 *
 * @param String id
 * @param String username
 */
const verifyToken = (id, user) => {
  const userId = sanitize(user, 'string', 6);
  return dbReadSelectors('tokens', { id, username: userId })
    .then(res => res.rows[0])
    .then(token => {
      if(!token) {
        return Promise.reject('Token not Found')
      }
    })
};

/**
 * function for authenticating the user
 *
 * @param req
 * @param res
 * @param function next
 */
const authenticate = (req, res, next) => {
  const requestToken = req.headers.token;
  if (requestToken) {
    getTokenById(requestToken)
      .then((token) => {
        if (token) {
          verifyToken(requestToken, token.username, (err) => {
            if (!err) {
              req.user = token.username;
              req.user_id = token.user_id;
              next();
            } else {
              res.status(403).json({ Error: err }).end();
            }
          });
        } else {
          res.status(403).json({ Error: 'Token doesnot exists!' }).end();
        }
      }).catch(() => {
        res.status(500).json({ Error: 'Could not validate the token' }).end();
      });
  } else {
    res.status(403).json({ Error: 'Token not provided' }).end();
  }
};


// Add local functions for export
tokenHandler.verifyToken = verifyToken;
tokenHandler.getTokenById = getTokenById;
tokenHandler.authenticate = authenticate;

// Export the controller
module.exports = tokenHandler;

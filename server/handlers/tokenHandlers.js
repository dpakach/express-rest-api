/**
 * Handler for token related routes
 */

// Require dependencies
const uuid = require('uuid/v4');

const {
  dbCreate, dbRead, dbRemove, dbUpdate, dbReadSelectors,
} = require('../db');
const { sanitize } = require('../utils');
const { validatePassword } = require('./userHandler');

// create user handler object
const tokenHandler = {};

/**
 * function for returning token by id
 *
 * @param string id
 * @param function callback(err, status, data)
 */
const getTokenById = (id, callback) => {
  if (id) {
    dbRead('tokens', id, ['id', 'username', 'user_id', 'expires'])
      .then((res) => {
        callback(false, res.rows[0]);
      })
      .catch(() => {
        callback('Unable to find the token');
      });
  } else {
    callback('Missing required values');
  }
};

/**
 * Handler for creating token
 *
 * @param object data, an object containing user data
 * @param function callback(err, status)
 */
tokenHandler.createToken = (data, callback) => {
  const username = sanitize(data.username, 'string', 6);
  const password = sanitize(data.password, 'string', 6);
  const id = uuid();
  if (username && password && id) {
    validatePassword(username, password, (err, userId) => {
      if (!err) {
        const expires = Date.now() + 60 * 60 * 1000;
        dbCreate('tokens', {
          username, id, expires, user_id: userId,
        })
          .then(() => {
            getTokenById(id, (err, token) => {
              if (!err) {
                callback(200, token);
              } else {
                callback(500, { Error: 'Could not retrive the created token' });
              }
            });
          }).catch(() => {
            callback(500, { Error: 'Error writing in database' });
          });
      } else {
        callback(403, { Error: 'Failed to validate your password' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values' });
  }
};

/**
 * Handler for getting token of a user
 *
 * @param string id
 * @param function callback(err, status, data)
 */
tokenHandler.getTokenHandler = (id, callback) => {
  getTokenById(id, (err, token) => {
    if (!err) {
      callback(200, token);
    } else {
      callback(404, { Error: err });
    }
  });
};

/**
 * Handler for changing password
 *
 * @param object data, an object containing user data
 * @param function callback(err, status)
 */
tokenHandler.extendToken = (id, callback) => {
  if (id) {
    getTokenById(id, (err, token) => {
      if (!err && token) {
        if (token.expires > Date.now()) {
          const expires = Date.now() + 60 * 60 * 1000;
          dbUpdate('tokens', id, { expires })
            .then(() => {
              callback(200);
            }).catch(() => {
              callback(500, { Error: 'Could not extend your token' });
            });
        } else {
          callback(403, { Error: 'Token already expired' });
        }
      } else {
        callback(404, { Error: 'Could not get the token specified' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values' });
  }
};

/**
 * Handler for deleting password
 *
 * @param object data, an object containing user data
 * @param function callback(err, status)
 */
tokenHandler.removeToken = (id, callback) => {
  if (id) {
    getTokenById(id, (err, token) => {
      if (!err && token) {
        dbRemove('tokens', id)
          .then(() => {
            callback(200);
          }).catch(() => {
            callback(500, { Error: 'Could not delete your token' });
          });
      } else {
        callback(404, { Error: 'Could not get the token specified' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values' });
  }
};

/**
 * function for verifying the token is valid
 *
 * @param String id
 * @param String username
 * @param function callback(err)
 */
const verifyToken = (id, user, callback) => {
  const userId = sanitize(user, 'string', 6);
  if (userId && id) {
    dbReadSelectors('tokens', { id, username: userId })
      .then((res) => {
        if (res.rows.length > 0) {
          if (res.rows[0].expires > Date.now()) {
            callback(false);
          } else {
            callback('Token already expired');
          }
        } else {
          callback('Could not find your token');
        }
      }).catch(() => {
        callback('Could not find your token');
      });
  } else {
    callback('Missing required fields');
  }
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
    getTokenById(requestToken, (err, token) => {
      if (!err && token) {
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
        res.status(403).end();
      }
    });
  } else {
    res.status(403).end();
  }
};


// Add local functions for export
tokenHandler.verifyToken = verifyToken;
tokenHandler.getTokenById = getTokenById;
tokenHandler.authenticate = authenticate;

// Export the controller
module.exports = tokenHandler;

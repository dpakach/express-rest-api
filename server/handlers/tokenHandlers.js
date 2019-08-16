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
 * @param function callback(err, status)
 */
tokenHandler.createToken = (data, callback) => {
  const username = sanitize(data.username, 'string', 6);
  const password = sanitize(data.password, 'string', 6);
  const id = uuid();
  if (username && password && id) {
    validatePassword(username, password)
      .then((userId) => {
        const expires = Date.now() + 60 * 60 * 1000;
        dbCreate('tokens', {
          username, id, expires, user_id: userId,
        })
          .then(() => {
            getTokenById(id)
              .then((token) => {
                if (token) {
                  callback(200, token);
                } else {
                  callback(404, { Error: 'Could not retrive the created token' });
                }
              }).catch((e) => {
                callback(500, e);
              });
          }).catch(() => {
            callback(500, { Error: 'Error writing in database' });
          });
      }).catch((error) => {
        callback(403, error);// { Error: 'Failed to validate your password' });
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
  getTokenById(id)
    .then((token) => {
      if (token) {
        callback(200, token);
      } else {
        callback(404, { Error: 'Could not find the token!' });
      }
    }).catch((err) => {
      callback(500, err);
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
    getTokenById(id)
      .then((token) => {
        if (!token) {
          callback(404, { Error: 'Could not get the token specified' });
        }
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
      }).catch((err) => {
        callback(500, err);
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
    getTokenById(id)
      .then((token) => {
        if (!token) {
          callback(404, { Error: 'Could not get the token specified' });
        }
        dbRemove('tokens', id)
          .then(() => {
            callback(200);
          }).catch(() => {
            callback(500, { Error: 'Could not delete your token' });
          });
      }).catch((err) => {
        callback(500, err);
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
        res.status(500).end({ Error: 'Could not validate the token' });
      });
  } else {
    res.status(403).end({ Error: 'Token not provided' });
  }
};


// Add local functions for export
tokenHandler.verifyToken = verifyToken;
tokenHandler.getTokenById = getTokenById;
tokenHandler.authenticate = authenticate;

// Export the controller
module.exports = tokenHandler;

/**
 * Handler for token related routes
 */

// Require dependencies
const uuid = require('uuid/v4');

const { query } = require('../db');
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
    const queryText = 'SELECT id, username, user_id, expires FROM tokens WHERE id like $1';
    const values = [id];
    query(queryText, values, (err, response) => {
      if (!err && response.rows[0]) {
        callback(false, response.rows[0]);
      } else {
        callback('Unable to find the token');
      }
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
        const queryText = 'INSERT INTO "tokens" ("id", "username", "user_id", "expires") VALUES($1, $2, $3, $4)';
        const values = [id, username, userId, expires];
        query(queryText, values, (err) => {
          if (!err) {
            getTokenById(id, (err, status, token) => {
              if (!err) {
                callback(200, token);
              } else {
                callback(500, { Error: 'Could not retrive the created token' });
              }
            });
          } else {
            callback(400, { Error: 'Error writing in database' });
          }
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
          const newExpires = Date.now() + 60 * 60 * 1000;
          const queryText = 'UPDATE tokens SET expires = $1 WHERE id like $2';
          const values = [newExpires, id];
          query(queryText, values, (err) => {
            if (!err) {
              callback(200);
            } else {
              callback(400, { Error: 'Could not extend your token' });
            }
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
        const queryText = 'DELETE FROM tokens WHERE id like $1';
        const values = [token.id];
        query(queryText, values, (err) => {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: 'Could not delete your token' });
          }
        });
      } else {
        callback(404, { Error: 'Could not get the token specified' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values' });
  }
};

const verifyToken = (id, username, callback) => {
  const user = sanitize(username, 'string', 6);
  if (user && id) {
    const queryText = 'SELECT * FROM tokens WHERE id like $1 AND username like $2';
    const values = [id, user];
    query(queryText, values, (err, result) => {
      if (!err && result.rows[0].length > 0) {
        if (result.rows[0].expires > Date.now()) {
          callback(false);
        } else {
          callback('Token already expired');
        }
      } else {
        callback('Could not find your token');
      }
    });
  } else {
    callback('Missing required fields');
  }
};

// Add local functions for export
tokenHandler.verifyToken = verifyToken;
tokenHandler.getTokenById = getTokenById;

// Export the controller
module.exports = tokenHandler;

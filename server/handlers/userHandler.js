/**
 * Handler for user related features
 */

// Require dependencies
const uuid = require('uuid/v4');

const { query } = require('../db');
const { hash, sanitize } = require('../utils');

// create user handler object
const userHandler = {};

/**
 * function go get user info from the id
 *
 * @param string id
 * @param function callback(error, data)
 */
const getUserById = (id, callback) => {
  if (id) {
    const queryText = 'SELECT id, username, email FROM users where id like $1';
    const values = [id];
    query(queryText, values, (err, response) => {
      if (!err && response.rows[0]) {
        callback(false, response.rows[0]);
      } else {
        callback('Unable to find user.');
      }
    });
  } else {
    callback('Missing required values.');
  }
};

/**
 * Handler for returning one user
 *
 * @param string id
 * @param function callback(status, data)
 */
userHandler.getUserHandler = (id, callback) => {
  getUserById(id, (err, user) => {
    if (!err) {
      callback(200, user);
    } else {
      callback(404, { Error: err });
    }
  });
};

/**
 * Handler for creating user
 *
 * @param object data, an object containing user data
 * @param function callback(status, data)
 */
userHandler.createUser = (data, callback) => {
  const username = sanitize(data.username, 'string', 6);
  const email = sanitize(data.email, 'string', 6);
  let password = sanitize(data.password, 'string', 6);
  const id = uuid();
  password = hash(password);
  if (username && password && email && id) {
    const queryText = 'INSERT INTO "users"("id", "username", "password", "email") VALUES($1, $2, $3, $4)';
    const values = [id, username, password, email];
    query(queryText, values, (err) => {
      if (!err) {
        callback(200);
      } else {
        callback(400, { Error: 'The user might already exist!' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values.' });
  }
};

/**
 * validate password of user
 *
 * @param String username
 * @param String userPassword
 * @param function callback
 */
const validatePassword = (username, userPassword, callback) => {
  let password = sanitize(userPassword, 'string', 6);
  password = hash(password);
  if (username && password) {
    const queryText = 'SELECT id FROM users WHERE username LIKE $1 AND password LIKE $2';
    const values = [username, password];
    query(queryText, values, (err, response) => {
      if (!err && response.rows.length > 0) {
        callback(false);
      } else {
        callback('Could not validate given user id and password');
      }
    });
  } else {
    callback('Missing required values.');
  }
};

/**
 * Handler for changing password
 *
 * @param object data, an object containing user data
 * @param function callback(err, status)
 */
userHandler.changePassword = (id, data, callback) => {
  let password = sanitize(data.newPassword, 'string', 6);
  let oldPassword = sanitize(data.password, 'string', 6);
  console.log(id, password, oldPassword);
  if (id && password && oldPassword) {
    getUserById(id, (err, user) => {
      if (!err) {
        validatePassword(user.username, oldPassword, (err) => {
          password = hash(password);
          oldPassword = hash(oldPassword);
          if (!err) {
            const queryText = 'UPDATE users SET password = $1 WHERE id like $2 AND password like $3';
            const values = [password, id, oldPassword];
            query(queryText, values, (err) => {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: 'Could not change your password' });
              }
            });
          } else {
            callback(403, { Error: 'Failed to validate given password' });
          }
        });
      } else {
        callback(404, { Error: 'Could not find the user' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values.' });
  }
};

userHandler.getUserById = getUserById;

// Export the controller
module.exports = userHandler;

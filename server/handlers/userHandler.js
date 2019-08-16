/**
 * Handler for user related features
 *
 * @TODO use tokens to verify only the verified users can view and modify user data
 *
 */

// Require dependencies
const uuid = require('uuid/v4');

const {
  dbCreate, dbRead, dbReadSelectors, dbUpdateSelector,
} = require('../db');
const { hash, sanitize } = require('../utils');

// create user handler object
const userHandler = {};

/**
 * function go get user info from the id
 *
 * @param string id
 * @param function callback(error, data)
 */
const getUserById = (id) => {
  if (!id) {
    Promise.reject(new Error('Missing required values.'));
  }
  return dbRead('users', id, ['id', 'username', 'email'])
    .then((res) => res.rows[0]);
};

/**
 * function go get user info from the username
 *
 * @param string username
 * @param function callback(error, data)
 */
const getUserByUsername = (username) => {
  if (!username) {
    Promise.reject(new Error('Missing required values.'));
  }
  return dbReadSelectors('users', { username }, ['id', 'username', 'email'])
    .then((res) => res.rows[0]);
};

/**
 * Handler for returning one user
 *
 * @param string id
 * @param function callback(status, data)
 */
userHandler.getUserHandler = (id, callback) => {
  getUserById(id)
    .then((user) => {
      if (user) {
        callback(200, user);
      } else {
        callback(404, { Error: 'User Not found' });
      }
    }).catch((err) => {
      callback(500, { Error: err });
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
    dbCreate('users', {
      id, username, password, email,
    })
      .then(() => {
        callback(200, false);
      }).catch(() => {
        callback(400, { Error: 'Error writing in database!' });
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
const validatePassword = (username, userPassword) => {
  let password = sanitize(userPassword, 'string', 6);
  password = hash(password);
  if (!username || !password) {
    return Promise.reject(new Error('Missing required values'));
  }
  return new Promise((resolve, reject) => {
    dbReadSelectors('users', { username, password }, ['id'])
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0].id);
        } else {
          reject(new Error('Could not validate given username and password'));
        }
      });
  });
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
  if (id && password && oldPassword) {
    getUserById(id)
      .then((user) => validatePassword(user.username, oldPassword))
      .then((id) => {
        password = hash(password);
        oldPassword = hash(oldPassword);
        dbUpdateSelector('users', { id, password: oldPassword }, { password })
          .then(() => {
            callback(200);
          }).catch(() => {
            callback(500, { Error: 'Could not change your password' });
          });
      }).catch((err) => {
        callback(404, { Error: err });
      });
  } else {
    callback(400, { Error: 'Missing required values.' });
  }
};

userHandler.getUserById = getUserById;
userHandler.getUserByUsername = getUserByUsername;
userHandler.validatePassword = validatePassword;

// Export the controller
module.exports = userHandler;

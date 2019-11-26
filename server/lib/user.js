/**
 * Handler for user related features
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
 * @param {string} id
 *
 * @return {Promise<Object>}
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
 * @param {string} username
 *
 * @return {Promise<Object>}
 */
const getUserByUsername = (username) => {
  if (!username) {
    Promise.reject(new Error('Missing required values.'));
  }
  return dbReadSelectors('users', { username }, ['id', 'username', 'email'])
    .then((res) => res.rows[0]);
};

/**
 * Handler for creating user
 *
 * @param {Object} data
 *
 * @return {Promise<Object>}
 */
userHandler.createUser = (data) => {
  const username = sanitize(data.username, 'string', 6);
  const email = sanitize(data.email, 'string', 6);
  let password = sanitize(data.password, 'string', 6);
  const id = uuid();
  password = hash(password);
  if (!(username && password && email && id)) {
    return Promise.reject(new Error('Missing required values.'));
  }
  return dbCreate('users', {
    id, username, password, email,
  })
    .then(() => getUserById(id));
};

/**
 * validate password of user
 *
 * @param {string} username
 * @param {string} userPassword
 *
 * @return {Promise<Object>}
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
 * @param {string} id
 * @param {Object} data
 *
 * @return {Promise<Object>}
 */
userHandler.changePassword = (id, data) => {
  let password = sanitize(data.newPassword, 'string', 6);
  let oldPassword = sanitize(data.password, 'string', 6);
  if (!(id && password && oldPassword)) {
    return Promise.reject(new Error('Missing required values'));
  }

  return getUserById(id)
    .then((user) => validatePassword(user.username, oldPassword))
    .then((id) => {
      password = hash(password);
      oldPassword = hash(oldPassword);
      return dbUpdateSelector('users', { id, password: oldPassword }, { password });
    });
};

userHandler.getUserById = getUserById;
userHandler.getUserByUsername = getUserByUsername;
userHandler.validatePassword = validatePassword;

// Export the controller
module.exports = userHandler;

const { query } = require('../../server/db');

const { createUser } = require('../../server/handlers/userHandler');
const { createToken } = require('../../server/handlers/tokenHandlers');
const usersFixtures = require('../fixtures/users.json');

const helpers = {};

helpers.dropAllTables = (done) => {
  const queryText = 'TRUNCATE TABLE users, tokens, posts;';
  query(queryText, (err) => {
    if (!err) {
      done();
    } else {
      done(new Error(err.Error));
    }
  });
};

helpers.createTestUser = (user) => new Promise((resolve, reject) => {
  if (!usersFixtures.hasOwnProperty(user)) {
    reject(new Error(`Could not find test user with username ${user.toString()}`));
  }
  createUser(usersFixtures[user], (status, err) => {
    if (status === 200) {
      createToken(usersFixtures[user], (status, data) => {
        if (status === 200 && data) {
          resolve(data);
        } else {
          reject(data.Error);
        }
      });
    } else {
      reject(err.Error);
    }
  });
});

module.exports = helpers;

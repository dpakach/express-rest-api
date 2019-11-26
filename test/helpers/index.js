const { query } = require('../../server/db');

const { createUser } = require('../../server/lib/user');
const { createToken } = require('../../server/lib/token');
const usersFixtures = require('../fixtures/users.json');

const helpers = {};

/**
 * Helper function to clean all tables in the test database
 *
 * @param {callback} done
 *
 * @return {void}
 */
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

/**
 * Helper function to create a test user from user Fixtures
 *
 * @param {string} user
 *
 * @return {Promise<Object>}
 */
helpers.createTestUser = (user) => createUser(usersFixtures[user])
  .then((data) => createToken(data.id));

module.exports = helpers;

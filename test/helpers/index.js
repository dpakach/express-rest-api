const { query } = require('../../server/db');

const { createUser } = require('../../server/lib/user');
const { createToken } = require('../../server/lib/token');
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

helpers.createTestUser = user => {
  return createUser(usersFixtures[user])
    .then((data) => createToken(data.id))
}

module.exports = helpers;

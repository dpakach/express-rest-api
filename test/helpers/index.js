const { query } = require('../../server/db');

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

module.exports = helpers;

const { Pool } = require('pg');

const { db } = require('../../config');

console.log(db);

const pool = new Pool(db);

module.exports = {
  query: (text, params, callback) => pool.query(text, params, callback),
};

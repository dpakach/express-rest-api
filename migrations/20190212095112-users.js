/* eslint-disable */

let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/* eslint-enable */
exports.up = (db, callback) => {
  // Create users table
  // TODO: add additional fields to the user table
  db.createTable(
    'users',
    {
      columns: {
        id: {
          type: 'string',
          length: 64,
          primaryKey: true,
          unique: true,
        },
        username: {
          type: 'string',
          length: '64',
          unique: true,
        },
        password: {
          type: 'string',
          length: 256,
        },
        email: {
          type: 'string',
          length: 64,
          unique: true,
        },
      },
      ifNotExists: true,
    },
    callback,
  );
};

exports.down = db => db.dropTable('users');

/* eslint-disable */
exports._meta = {
  version: 1,
};

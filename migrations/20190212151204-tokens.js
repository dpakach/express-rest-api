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
  db.createTable(
    'tokens',
    {
      columns: {
        id: {
          type: 'string',
          length: 64,
          primaryKey: true,
          unique: true,
        },
        user_id: {
          type: 'string',
          length: 64,
        },
        username: {
          type: 'string',
          length: 64,
        },
        expires: {
          type: 'string',
          length: 64,
        },
      },
      ifNotExists: true,
    },
    callback,
  );
};

exports.down = db => db.dropTable('tokens');

/* eslint-disable */
exports._meta = {
  version: 1,
};

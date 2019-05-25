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
exports.up = function (db) {
  return db.createTable('posts', {
    columns: {
      id: {
        type: 'string',
        primaryKey: true,
        length: 64,
        unique: true,
        notNull: true,
      },
      content: {
        type: 'string',
        length: 4069,
      },
      title: {
        type: 'string',
        length: 1024,
        notNull: true,
      },
      author: {
        type: 'string',
        length: '64',
        notNull: true,
        foreignKey: {
          name: 'post_author_id_fk',
          table: 'users',
          rules: {
            onDelete: 'CASCADE',
            onUpdate: 'RESTRICT',
          },
          mapping: 'id',
        },
      },
      created: {
        type: 'string',
        length: 64,
        notNull: true,
      },
      modified: {
        type: 'string',
        length: 64,
        notNull: true,
      },
    },
  });
};

exports.down = function (db) {
  db.dropTable('posts');
};

/* eslint-disable */
exports._meta = {
  version: 1,
};

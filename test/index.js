/* eslint no-undef:0 */

process.env.NODE_ENV = 'test';

const { dropAllTables } = require('./helpers');

describe('Tests', () => {
  afterEach((done) => {
    dropAllTables(done);
  });

  describe('UNIT TESTS', () => {
    require('./unit');
  });

  describe('API TESTS', () => {
    require('./api');
  });
});

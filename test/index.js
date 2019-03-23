/* eslint no-undef:0 */

process.env.NODE_ENV = 'test';

describe('UNIT TESTS', () => {
  require('./unit');
});
describe('API TESTS', () => {
  require('./api');
});

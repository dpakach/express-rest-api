const assert = require('assert');

const utils = require('../../server/utils');

const tests = {};

tests['Sanitize word with length less than limit'] = function (done) {
  const result = utils.sanitize('Hello', 'string', 6);
  assert.equal(result, false);
  done();
};

tests['Sanitize a word with length greater than limit'] = function (done) {
  const result = utils.sanitize('Hello World', 'string', 2);
  assert.equal(result, 'Hello World');
  done();
};

tests['Sanitize an string with int type'] = function (done) {
  const result = utils.sanitize('lorem', 'int');
  assert.equal(result, false);
  done();
};

tests['Sanitize an int with string type'] = function (done) {
  const result = utils.sanitize(1, 'string');
  assert.equal(result, false);
  done();
};

tests['Hash returns correct value'] = function (done) {
  assert.equal(
    utils.hash('lorem'),
    '9b2595cafa774fc8f223446b05bd8a7a97b99c88ffab2a7ecc9fc9569587afda',
  );
  done();
};

tests['Hash with invalid argument'] = function (done) {
  assert.equal(utils.hash(1), false);
  assert.equal(utils.hash(1.22), false);
  assert.equal(utils.hash({ key: 'value' }), false);
  assert.equal(utils.hash(''), false);
  done();
};

module.exports = tests;

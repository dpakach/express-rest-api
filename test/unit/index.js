/*
 * Unit Tests
 */

/* eslint no-undef:0 */

const assert = require('assert');

const utils = require('../../server/utils');

const tests = {};

describe('Tests for Sanitize function', () => {
  it('Sanitize word with length less than limit', (done) => {
    const result = utils.sanitize('Hello', 'string', 6);
    assert.equal(result, false);
    done();
  });

  it('Sanitize a word with length greater than limit', (done) => {
    const result = utils.sanitize('Hello World', 'string', 2);
    assert.equal(result, 'Hello World');
    done();
  });

  it('Sanitize an string with int type', (done) => {
    const result = utils.sanitize('lorem', 'int');
    assert.equal(result, false);
    done();
  });

  it('Sanitize an int with string type', (done) => {
    const result = utils.sanitize(1, 'string');
    assert.equal(result, false);
    done();
  });
});

describe('Tests for Hash function', () => {
  it('Hash returns correct value', (done) => {
    assert.equal(
      utils.hash('lorem'),
      '9b2595cafa774fc8f223446b05bd8a7a97b99c88ffab2a7ecc9fc9569587afda',
    );
    done();
  });
  it('Hash with invalid argument', (done) => {
    assert.equal(utils.hash(1), false);
    assert.equal(utils.hash(1.22), false);
    assert.equal(utils.hash({ key: 'value' }), false);
    assert.equal(utils.hash(''), false);
    done();
  });
});

module.exports = tests;

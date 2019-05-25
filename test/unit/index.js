/*
 * Unit Tests
 */

/* eslint no-undef:0 */

const assert = require('assert');

const chai = require('chai');

const utils = require('../../server/utils');
const { verifyToken, createToken, getTokenById } = require('../../server/handlers/tokenHandlers');
const {
  createUser, getUserById, getUserByUsername, validatePassword,
} = require('../../server/handlers/userHandler');
const { query } = require('../../server/db');
const usersFixtures = require('../fixtures/users.json');

const { expect } = chai;


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

describe('Token related functions should work', () => {
  userData = {};
  beforeEach((done) => {
    createUser(usersFixtures.testuser, (status, err) => {
      if (!err) {
        createToken(usersFixtures.testuser, (status, data) => {
          if (status === 200) {
            userData.testuser = data;
            done();
          } else {
            done(new Error(err.Error));
          }
        });
      } else {
        done(new Error(err.Error));
      }
    });
  });

  afterEach((done) => {
    const queryText = 'TRUNCATE TABLE users, tokens, posts;';
    query(queryText, (err) => {
      if (!err) {
        done();
      } else {
        done(new Error(err.Error));
      }
    });
  });

  it('Verify Token Should not give error on using correct token', (done) => {
    verifyToken(userData.testuser.id, usersFixtures.testuser.username, (err) => {
      expect(err).to.be.eql(false);
      done();
    });
  });

  it('Verify Token Should give error on using incorrect token', (done) => {
    verifyToken('invalid token', usersFixtures.testuser.username, (err) => {
      expect(err).not.to.be.eql(false);
      expect(err).to.be.a('string');
      done();
    });
  });

  it('Verify Token Should give error on using incorrect username', (done) => {
    verifyToken(userData.testuser.id, 'invalid_username', (err) => {
      expect(err).not.to.be.eql(false);
      expect(err).to.be.a('string');
      done();
    });
  });

  it('Verify Token Should give error on using incorrect username and token', (done) => {
    verifyToken('invalid_token', 'invalid_username', (err) => {
      expect(err).not.to.be.eql(false);
      expect(err).to.be.a('string');
      done();
    });
  });

  it('Get token by Id should work on using correct token', (done) => {
    getTokenById(userData.testuser.id, (err, data) => {
      expect(err).to.be.eql(false);
      expect(data.username).to.be.eql(userData.testuser.username);
      expect(data.user_id).to.be.eql(userData.testuser.user_id);
      expect(data.id).to.be.eql(userData.testuser.id);
      done();
    });
  });

  it('Get token by Id should not work on using incorrect token', (done) => {
    getTokenById('invalid_token', (err, data) => {
      expect(err).not.to.be.eql(false);
      expect(err).to.be.a('string');
      expect(data).to.be.eql(undefined);
      done();
    });
  });
});

describe('User related functions should work', () => {
  userData = {};
  beforeEach((done) => {
    createUser(usersFixtures.testuser, (status, err) => {
      if (!err) {
        createToken(usersFixtures.testuser, (status, data) => {
          if (status === 200) {
            userData.testuser = data;
            done();
          } else {
            done(new Error(err.Error));
          }
        });
      } else {
        done(new Error(err.Error));
      }
    });
  });

  afterEach((done) => {
    const queryText = 'TRUNCATE TABLE users, posts, tokens;';
    query(queryText, (err) => {
      if (!err) {
        done();
      } else {
        done(new Error(err.Error));
      }
    });
  });

  it('Get User by Id should work', (done) => {
    getUserById(userData.testuser.user_id, (err, data) => {
      expect(err).to.be.eql(false);
      expect(data.id).to.be.eql(userData.testuser.user_id);
      expect(data.username).to.be.eql(usersFixtures.testuser.username);
      expect(data.email).to.be.eql(usersFixtures.testuser.email);
      done();
    });
  });

  it('Get User by Id should not work with invalid user id', (done) => {
    getUserById('invalid_user_id', (err, data) => {
      expect(err).not.to.be.eql(false);
      expect(err).be.a('string');
      expect(data).be.eql(undefined);
      done();
    });
  });

  it('Get User by username should work', (done) => {
    getUserByUsername(usersFixtures.testuser.username, (err, data) => {
      expect(err).to.be.eql(false);
      expect(data.id).to.be.eql(userData.testuser.user_id);
      expect(data.username).to.be.eql(usersFixtures.testuser.username);
      expect(data.email).to.be.eql(usersFixtures.testuser.email);
      done();
    });
  });

  it('Get User by username should not work with invalid username', (done) => {
    getUserByUsername('invalid_username', (err, data) => {
      expect(err).not.to.be.eql(false);
      expect(err).be.a('string');
      expect(data).be.eql(undefined);
      done();
    });
  });

  it('Validate Password should work for correct username and password', (done) => {
    validatePassword(usersFixtures.testuser.username, usersFixtures.testuser.password, (err) => {
      expect(err).to.be.eql(false);
      done();
    });
  });

  it('Validate Password should not work for correct username and incorrect password', (done) => {
    validatePassword(usersFixtures.testuser.username, 'invalid_password', (err) => {
      expect(err).not.to.be.eql(false);
      expect(err).to.be.a('string');
      done();
    });
  });

  it('Validate Password should not work for incorrect username and correct password', (done) => {
    validatePassword('invalid_username', usersFixtures.testuser.password, (err) => {
      expect(err).not.to.be.eql(false);
      expect(err).to.be.a('string');
      done();
    });
  });

  it('Validate Password should not work for incorrect username and incorrect password', (done) => {
    validatePassword('invalid_username', 'invalid_password', (err) => {
      expect(err).not.to.be.eql(false);
      expect(err).to.be.a('string');
      done();
    });
  });
});

module.exports = tests;

/* eslint no-undef:0 */
const chai = require('chai');
const chaiHttp = require('chai-http');

const uuid = require('uuid/v4');

const server = require('../../start');
const { query } = require('../../server/db');

const {
  createUser,
  getUserByUsername,
  validatePassword,
} = require('../../server/handlers/userHandler');
const {
  createToken,
} = require('../../server/handlers/tokenHandlers');

const usersFixtures = require('../fixtures/users.json');

const { expect } = chai;
chai.use(chaiHttp);

describe('User routes test', () => {
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

  describe('/POST user works', () => {
    it('It should be possible to create user', (done) => {
      chai
        .request(server)
        .post('/user')
        .send(usersFixtures.testuser2)
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.eqls(false);
          getUserByUsername(usersFixtures.testuser2.username, (err, data) => {
            if (!err) {
              expect(data.username).to.be.eql(usersFixtures.testuser2.username);
              expect(data.email).to.be.eql(usersFixtures.testuser2.email);
              expect(data.username).to.be.eql(usersFixtures.testuser2.username);
              done();
            } else {
              done(new Error(JSON.stringify(err)));
            }
          });
        });
    });
  });

  describe('/GET user works', () => {
    it('It should be possible to get user', (done) => {
      chai
        .request(server)
        .get(`/user/${userData.testuser.user_id}`)
        .set('token', userData.testuser.id)
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body.username).to.be.eql(usersFixtures.testuser.username);
          expect(res.body.email).to.be.eql(usersFixtures.testuser.email);
          expect(res.body.id).to.be.eql(userData.testuser.user_id);
          done();
        });
    });

    it('It should not be possible to get user without token', (done) => {
      chai
        .request(server)
        .get(`/user/${userData.testuser.user_id}`)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          done();
        });
    });

    it('It should not be possible to get user that doesnot exist', (done) => {
      chai
        .request(server)
        .get('/user/i_dont_exist')
        .set('token', userData.testuser.id)
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          expect(res.body).to.be.eql({});
          done();
        });
    });

    it('It should not be possible to get user with a token that doesnot exist', (done) => {
      chai
        .request(server)
        .get(`/user/${userData.testuser.user_id}`)
        .set('token', 'i_dont_exist')
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          done();
        });
    });

    it('It should not be possible to get user with a expired token', (done) => {
      const queryText = 'insert into "tokens"("id", "user_id", "username", "expires") values($1, $2, $3, $4);';
      const values = [
        uuid(),
        userData.testuser.user_id,
        userData.testuser.username,
        Date.now() - 1,
      ];
      query(queryText, values, (err) => {
        if (!err) {
          const queryText = `select id, username from tokens where username like '${userData.testuser.username}' and cast (expires as bigint) < ${Date.now()}`;
          query(queryText, (err, data) => {
            if (!err) {
              chai
                .request(server)
                .get(`/user/${userData.testuser.user_id}`)
                .set('token', data.rows[0].id)
                .end((err, res) => {
                  expect(res.status).to.be.eql(403);
                  expect(res.body.username).to.be.eql(undefined);
                  expect(res.body.email).to.be.eql(undefined);
                  expect(res.body.id).to.be.eql(undefined);
                  done();
                });
            } else {
              done(err);
            }
          });
        } else {
          done(err);
        }
      });
    });
  });
});

describe('Password routes test', () => {
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

  describe('/POST user password works', () => {
    it('It should be possible to change user password', (done) => {
      newPassword = 'newtestpass';
      chai
        .request(server)
        .post(`/user/${userData.testuser.user_id}/password`)
        .set('token', userData.testuser.id)
        .send({
          newPassword,
          password: usersFixtures.testuser.password,
        })
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.eql('');
          validatePassword(userData.testuser.username, newPassword, (err) => {
            if (!err) {
              done();
            } else {
              done(new Error('New password could not be validated'));
            }
          });
        });
    });

    it('It should not be possible to change user password without header token', (done) => {
      newPassword = 'newtestpass';
      chai
        .request(server)
        .post(`/user/${userData.testuser.user_id}/password`)
        .send({
          newPassword,
          password: usersFixtures.testuser.password,
        })
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          validatePassword(userData.testuser.username, newPassword, (err) => {
            if (err) {
              done();
            } else {
              done(new Error('Could not validate the password'));
            }
          });
        });
    });

    it('It should not be possible to change password of non existant user', (done) => {
      newPassword = 'newtestpass';
      chai
        .request(server)
        .post('/user/i_dont_exist/password')
        .send({
          newPassword,
          password: usersFixtures.testuser.password,
        })
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          validatePassword(userData.testuser.username, newPassword, (err) => {
            if (err) {
              done();
            } else {
              done(new Error('Could not validate the password'));
            }
          });
        });
    });

    it('It should not be possible to change password if incorrect password is given', (done) => {
      newPassword = 'newtestpass';
      chai
        .request(server)
        .post(`/user/${userData.testuser.user_id}/password`)
        .send({
          newPassword,
          password: 'incorrect_password',
        })
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          validatePassword(userData.testuser.username, newPassword, (err) => {
            if (err) {
              done();
            } else {
              done(new Error('Could not validate the password'));
            }
          });
        });
    });

    it('It should not be possible to change user password without old password', (done) => {
      newPassword = 'newtestpass';
      chai
        .request(server)
        .post(`/user/${userData.testuser.user_id}/password`)
        .send({
          newPassword,
        })
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          validatePassword(userData.testuser.username, newPassword, (err) => {
            if (err) {
              done();
            } else {
              done(new Error('Could not validate the password'));
            }
          });
        });
    });
  });
});

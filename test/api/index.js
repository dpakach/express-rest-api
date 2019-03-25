/* eslint no-undef:0 */
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../start');
const { query } = require('../../server/db');
const {
  createUser,
  getUserByUsername,
  validatePassword,
} = require('../../server/handlers/userHandler');
const {
  createToken,
  verifyToken,
  getTokenById,
} = require('../../server/handlers/tokenHandlers');
const usersFixtures = require('../fixtures/users.json');

const { expect } = chai;
chai.use(chaiHttp);

describe('Ping route test', () => {
  describe('/GET ping', () => {
    it('It should get a response back on ping', (done) => {
      chai
        .request(server)
        .get('/ping')
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.eql({});
          done();
        });
    });
  });
});

describe('Token routes test', () => {
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
    const queryText = 'TRUNCATE TABLE users, tokens;';
    query(queryText, (err) => {
      if (!err) {
        done();
      } else {
        done(new Error(err.Error));
      }
    });
  });

  describe('/POST token works', () => {
    it('It should be possible to create token', (done) => {
      userData = {
        username: 'testuser',
        password: 'testpassword',
      };
      requestTime = Date.now();
      chai
        .request(server)
        .post('/token')
        .send(userData)
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.a('object');
          expect(res.body.username).to.be.equals(userData.username);
          expect(Number.parseInt(res.body.expires, 10)).to.be.greaterThan(
            requestTime + 3600000,
          );
          done();
        });
    });
  });

  describe('/GET token works', () => {
    it('It should be possible to get token', (done) => {
      requestTime = Date.now();
      chai
        .request(server)
        .get(`/token/${userData.testuser.id}`)
        .set('token', userData.testuser.id)
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.a('object');
          expect(res.body.username).to.be.equals(userData.username);
          expect(res.body).to.haveOwnProperty('id');
          expect(res.body).to.haveOwnProperty('user_id');
          expect(res.body).to.haveOwnProperty('expires');
          verifyToken(res.body.id, usersFixtures.testuser.username, (err) => {
            if (!err) {
              done();
            } else {
              done(new Error(JSON.stringify(err)));
            }
          });
        });
    });

    it('It should not be possible to get token without header token', (done) => {
      requestTime = Date.now();
      chai
        .request(server)
        .get(`/token/${userData.testuser.id}`)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          done();
        });
    });
  });

  describe('/PUT token works', () => {
    it('It should be possible to extend token', (done) => {
      requestTime = Date.now();
      chai
        .request(server)
        .put(`/token/${userData.testuser.id}`)
        .set('token', userData.testuser.id)
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.eql('');
          getTokenById(userData.testuser.id, (err, data) => {
            if (!err && data) {
              expect(Number.parseInt(data.expires, 10)).to.be.greaterThan(
                requestTime + 3600000,
              );
              done();
            } else {
              done(new Error(JSON.stringify(err)));
            }
          });
        });
    });

    it('It should not be possible to extend token without token', (done) => {
      requestTime = Date.now();
      chai
        .request(server)
        .put(`/token/${userData.testuser.id}`)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          getTokenById(userData.testuser.id, (err, data) => {
            if (!err && data) {
              expect(Number.parseInt(data.expires, 10)).to.be.lessThan(
                requestTime + 3600000,
              );
              done();
            } else {
              done(new Error(JSON.stringify(err)));
            }
          });
        });
    });
  });

  describe('/DELETE token works', () => {
    it('It should be possible to remove token', (done) => {
      chai
        .request(server)
        .delete(`/token/${userData.testuser.id}`)
        .set('token', userData.testuser.id)
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.eql('');
          verifyToken(res.body.id, usersFixtures.testuser.username, (err) => {
            if (err) {
              getTokenById(userData.testuser.username, (err, data) => {
                if (!err && data) {
                  done(
                    new Error('Token still exists when it should be deleted'),
                  );
                } else {
                  done();
                }
              });
            } else {
              done(new Error('Token still exists when it should be deleted'));
            }
          });
        });
    });

    it('It should not be possible to remove token without header token', (done) => {
      chai
        .request(server)
        .delete(`/token/${userData.testuser.id}`)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          verifyToken(
            userData.testuser.id,
            usersFixtures.testuser.username,
            (err) => {
              if (!err) {
                done();
              } else {
                done(new Error('Token should exist but not found'));
              }
            },
          );
        });
    });
  });
});

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


  afterEach((done) => {
    const queryText = 'TRUNCATE TABLE users, tokens;';
    query(queryText, (err) => {
      if (!err) {
        done();
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

  afterEach((done) => {
    const queryText = 'TRUNCATE TABLE users, tokens;';
    query(queryText, (err) => {
      if (!err) {
        done();
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

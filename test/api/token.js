/* eslint no-undef:0 */
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../start');

const {
  createUser,
} = require('../../server/handlers/userHandler');

const {
  createToken,
  verifyToken,
  getTokenById,
} = require('../../server/handlers/tokenHandlers');

const usersFixtures = require('../fixtures/users.json');

const { expect } = chai;
chai.use(chaiHttp);

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

    it('It should not be possible to remove token that doesnot exist', (done) => {
      chai
        .request(server)
        .delete('/token/i_dont_exist')
        .set('token', userData.testuser.id)
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          expect(res.body.Error).not.to.be.eql(undefined);
          done();
        });
    });
  });
});

/* eslint no-undef:0 */
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../start');
const { query } = require('../../server/db');
const {
  createUser,
} = require('../../server/handlers/userHandler');
const {
  createToken,
} = require('../../server/handlers/tokenHandlers');
const {
  createPost,
  getPostById,
} = require('../../server/handlers/postHandler');

const usersFixtures = require('../fixtures/users.json');

const { expect } = chai;
chai.use(chaiHttp);

describe('Post routes test', () => {
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

  describe('/POST post works', () => {
    postData = {
      title: 'First post!',
      content: 'This is first Post',
    };
    it('It should be possible to create post', (done) => {
      requestTime = Date.now();
      chai
        .request(server)
        .post('/post')
        .send(postData)
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          responseTime = Date.now();
          expect(res.status).to.be.eql(200);
          data = res.body;
          expect(data.author.id).to.be.eql(userData.testuser.user_id);
          expect(data.title).to.be.eql(postData.title);
          expect(data.content).to.be.eql(postData.content);
          expect(
            requestTime
            < Number.parseInt(data.created, 10)
            < responseTime,
          ).to.be.eql(true);
          expect(data.created).to.be.eql(data.modified);
          done();
        });
    });

    it('It should not be possible to create post  without header token', (done) => {
      chai
        .request(server)
        .post('/post')
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          done();
        });
    });

    it('It should not be possible to create post witout title', (done) => {
      chai
        .request(server)
        .post('/post')
        .send({ content: postData.content })
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          expect(res.status).to.be.eql(400);
          expect(res.body.Error).not.to.be.eql(undefined);
          done();
        });
    });

    it('It should not be possible to create post witout content', (done) => {
      chai
        .request(server)
        .post('/post')
        .send({ title: postData.title })
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          expect(res.status).to.be.eql(400);
          expect(res.body.Error).not.to.be.eql(undefined);
          done();
        });
    });
  });

  describe('/GET post works', () => {
    postData = {
      title: 'First post!',
      content: 'This is first Post',
      created: Date.now(),
    };

    getPostData = {};
    beforeEach((done) => {
      createPost(userData.testuser.user_id, postData, (status, err, data) => {
        if (status === 200 && !err && data) {
          getPostData = data;
          done();
        } else {
          done(new Error(err.Error));
        }
      });
    });

    it('It should be possible to get post', (done) => {
      chai
        .request(server)
        .get(`/post/${getPostData.id}`)
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          responseTime = Date.now();
          expect(res.status).to.be.eql(200);
          data = res.body;
          expect(data.author.id).to.be.eql(userData.testuser.user_id);
          expect(data.title).to.be.eql(postData.title);
          expect(data.content).to.be.eql(postData.content);
          expect(data.created).to.be.eql(data.modified);
          expect(
            postData.created
            < Number.parseInt(data.created, 10)
            < responseTime,
          ).to.be.eql(true);
          done();
        });
    });

    it('It should not be possible to get post  without header token', (done) => {
      chai
        .request(server)
        .get(`/post/${getPostData.id}`)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          done();
        });
    });

    it('It should not be possible to get post with invalid id', (done) => {
      chai
        .request(server)
        .get('/post/this_id_doesnot_exist')
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          expect(res.body.Error).not.to.be.eql(undefined);
          done();
        });
    });
  });

  describe('/PUT post works', () => {
    postData = {
      title: 'First post!',
      content: 'This is first Post',
      created: Date.now(),
    };

    newPostData = {
      title: 'Updated post!',
      content: 'This is Updated Post',
      created: Date.now(),
    };

    getPostData = {};
    beforeEach((done) => {
      createPost(userData.testuser.user_id, postData, (status, err, data) => {
        if (status === 200 && !err && data) {
          getPostData = data;
          done();
        } else {
          done(new Error(err.Error));
        }
      });
    });
    requestTime = Date.now();
    it('It should be possible to update post', (done) => {
      chai
        .request(server)
        .put(`/post/${getPostData.id}`)
        .send(newPostData)
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          responseTime = Date.now();
          expect(res.status).to.be.eql(200);
          data = res.body;
          expect(data.author.id).to.be.eql(userData.testuser.user_id);
          expect(data.title).to.be.eql(newPostData.title);
          expect(data.content).to.be.eql(newPostData.content);
          expect(
            postData.created
            < Number.parseInt(data.created, 10)
            < requestTime,
          ).to.be.eql(true);
          expect(
            requestTime
            < Number.parseInt(data.modified, 10)
            < responseTime,
          ).to.be.eql(true);
          done();
        });
    });

    it('It should not be possible to update post  without header token', (done) => {
      chai
        .request(server)
        .put(`/post/${getPostData.id}`)
        .send(newPostData)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          done();
        });
    });

    it('It should not be possible to update post with invalid id', (done) => {
      chai
        .request(server)
        .put('/post/this_id_doesnot_exist')
        .send(newPostData)
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          expect(res.body.Error).not.to.be.eql(undefined);
          done();
        });
    });
  });

  describe('/DELETE post works', () => {
    postData = {
      title: 'First post!',
      content: 'This is first Post',
      created: Date.now(),
    };

    getPostData = {};
    beforeEach((done) => {
      createPost(userData.testuser.user_id, postData, (status, err, data) => {
        if (status === 200 && !err && data) {
          getPostData = data;
          done();
        } else {
          done(new Error(err.Error));
        }
      });
    });
    requestTime = Date.now();
    it('It should be possible to update post', (done) => {
      chai
        .request(server)
        .delete(`/post/${getPostData.id}`)
        .send(newPostData)
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.eql(false);
          getPostById(getPostData.id, (err, data) => {
            expect(data).to.be.eql(undefined);
            expect(err).not.to.be.eql(undefined);
            done();
          });
        });
    });

    it('It should not be possible to delete post  without header token', (done) => {
      chai
        .request(server)
        .delete(`/post/${getPostData.id}`)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body).to.be.eql({});
          done();
        });
    });

    it('It should not be possible to delete post with invalid id', (done) => {
      chai
        .request(server)
        .delete('/post/this_id_doesnot_exist')
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          expect(res.status).to.be.eql(404);
          expect(res.body.Error).not.to.be.eql(undefined);
          done();
        });
    });
  });
});

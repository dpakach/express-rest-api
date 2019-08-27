/* eslint no-undef:0 */
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../start');
const {
  createPost,
  getPostById,
} = require('../../server/lib/post');

const { createTestUser } = require('../helpers');

const { expect } = chai;
chai.use(chaiHttp);

describe('Post routes test', () => {
  userData = {};
  beforeEach((done) => {
    createTestUser('testuser')
      .then((data) => {
        userData.testuser = data;
        done();
      })
      .catch((e) => done(new Error(e)));
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
          expect(res.body.Error).not.to.be.eql(undefined);
          done();
        });
    });

    it('It should not be possible to create post without title', (done) => {
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

    it('It should not be possible to create post without content', (done) => {
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
      createPost(userData.testuser.user_id, postData)
        .then(data => {
          getPostData = data;
          done()
        }).catch(err => {
          done(err);
        })
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
          expect(res.body.Error).not.to.be.eql(undefined);
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
          expect(res.body).to.be.eql({});
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
      createPost(userData.testuser.user_id, postData)
        .then(data => {
          getPostData = data;
          done()
        }).catch(err => {
          done(err);
        })
    });
    it('It should be possible to update post', (done) => {
      requestTime = Date.now();
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
          expect(res.body.Error).not.to.be.eql(undefined);
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
          expect(res.body.Error).to.be.eql(undefined);
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
      createPost(userData.testuser.user_id, postData)
        .then(data => {
          getPostData = data;
          done()
        }).catch(err => {
          done(err);
        })
    });
    requestTime = Date.now();
    it('It should be possible to delete post', (done) => {
      chai
        .request(server)
        .delete(`/post/${getPostData.id}`)
        .send(newPostData)
        .set({ token: userData.testuser.id })
        .end((err, res) => {
          expect(res.status).to.be.eql(200);
          expect(res.body).to.be.eql({});
          getPostById(getPostData.id)
            .then((data) => {
              expect(data).to.be.eql(undefined);
              done();
            }).catch((err) => {
              done(err);
            });
        });
    });

    it('It should not be possible to delete post  without header token', (done) => {
      chai
        .request(server)
        .delete(`/post/${getPostData.id}`)
        .end((err, res) => {
          expect(res.status).to.be.eql(403);
          expect(res.body.Error).not.to.be.eql(undefined);
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
          expect(res.body).to.be.eql({});
          done();
        });
    });
  });
});

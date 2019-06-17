/* eslint no-undef:0 */
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../start');

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


require('./user');
require('./token');
require('./post');

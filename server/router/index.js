const { Router } = require('express');

const router = Router();

const {
  postPost, getPost, putPost, deletePost, getPosts,
} = require('../controllers/postController');
const { postUser, getUser, postUserPassword } = require('../controllers/userControllers');
const {
  postToken, getToken, deleteToken, putToken,
} = require('../controllers/tokenController');

const { authenticate } = require('../lib/token');

router.get('/ping', (req, res) => {
  res.status(200).end();
});

// user related routes
router.post('/user', postUser);
router.get('/user/:id', authenticate, getUser);
router.post('/user/:id/password', authenticate, postUserPassword);

// token related routes
router.post('/token', postToken);
router.get('/token/:id', authenticate, getToken);
router.put('/token/:id', authenticate, putToken);
router.delete('/token/:id', authenticate, deleteToken);

// post related routes
router.post('/post', authenticate, postPost);
router.get('/post/:id', authenticate, getPost);
router.put('/post/:id', authenticate, putPost);
router.delete('/post/:id', authenticate, deletePost);
router.get('/posts', authenticate, getPosts);

module.exports = router;

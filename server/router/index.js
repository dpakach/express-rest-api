const express = require('express');

const router = express.Router();

const { postUser, getUser, postUserPassword } = require('../controllers/userControllers');
const {
  postToken, getToken, deleteToken, putToken,
} = require('../controllers/tokenController');

const { authenticate } = require('../handlers/tokenHandlers');

router.get('/ping', (req, res) => {
  res.send('Ping');
  res.sendStatus(200);
});

router.post('/user', postUser);
router.get('/user/:id', authenticate, getUser);
router.post('/user/:id/password', authenticate, postUserPassword);

router.post('/token', postToken);
router.get('/token/:id', authenticate, getToken);
router.put('/token/:id', authenticate, putToken);
router.delete('/token/:id', authenticate, deleteToken);

module.exports = router;

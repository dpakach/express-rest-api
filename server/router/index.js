const express = require('express');

const router = express.Router();

const { postUser, getUser, postUserPassword } = require('../controllers/userControllers');
const {
  postToken, getToken, deleteToken, putToken,
} = require('../controllers/tokenController');

router.get('/ping', (req, res) => {
  res.send('Ping');
  res.sendStatus(200);
});

router.post('/user', postUser);
router.get('/user/:id', getUser);
router.post('/user/:id/password', postUserPassword);

router.post('/token', postToken);
router.get('/token/:id', getToken);
router.put('/token/:id', putToken);
router.delete('/token/:id', deleteToken);

module.exports = router;

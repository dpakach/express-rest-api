const express = require('express');

const router = express.Router();

const { postUser, getUser, postUserPassword } = require('../controllers/userControllers');

router.get('/ping', (req, res) => {
  res.send('Ping');
  res.sendStatus(200);
});

router.post('/user', postUser);
router.get('/user/:id', getUser);
router.post('/user/:id/password', postUserPassword);

module.exports = router;

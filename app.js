// Require dependencies
const bodyParser = require('body-parser');
const express = require('express');

const router = require('./server/router');

// Configure the app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use('/', router);

// Export the app
module.exports = app;

// Require dependencies
const bodyParser = require('body-parser');
const express = require('express');

// Configure the app
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Export the app
module.exports = app;

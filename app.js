// Require dependencies
const bodyParser = require('body-parser');
const express = require('express');

const router = require('./server/router');

// Configure the app
const app = express();

// use body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// use the router
app.use('/', router);

app.use((err, req, res, next) => {
  console.log(err);
  res.json({ Error: err }).end();
  next();
});

// Export the app
module.exports = app;

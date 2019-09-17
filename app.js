// Require dependencies
const bodyParser = require('body-parser');
const express = require('express');

const {notFound, developmentErrors, productionErrors} = require('./server/middlewares');
const config = require('./config');

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
app.use(notFound);

if (config.app.env === 'dev') {
  app.use(developmentErrors);
} else {
  app.use(productionErrors);
}

// Export the app
module.exports = app;

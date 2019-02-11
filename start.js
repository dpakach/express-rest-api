// Require all dependencies
const http = require('http');

const app = require('./app');
const config = require('./config');

// get port from config (3000 by default)
const { port } = config.app;

// start the server and listen in given port
http.createServer(app).listen(port, () => {
  console.log(`Started Server in port ${port}`);
});

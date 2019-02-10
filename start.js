// Require all dependencies
const http = require('http');

const app = require('./app');

// get port from env or use 3000 by default
const port = process.env.PORT || 3000;

// start the server and listen in given port
http.createServer(app).listen(port, () => {
	console.log(`Started Server in port ${port}`);
});

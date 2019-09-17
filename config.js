// Read env variables
require('dotenv').config();

// Get the current environment ('dev' | 'test')
const env = process.env.NODE_ENV || 'dev';

// Base config object
// for new config object extend from this
function getBase() {
  const base = {
    app: {
      env,
      port: parseInt(process.env.PORT, 10) || 3000,
      secret: 'secret',
    },
    db: {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  };
  return base;
}

// config object for 'development' environment
const dev = getBase();

// config object for 'test' environment
const test = getBase();
test.app.port = parseInt(process.env.TEST_PORT, 10) || 4000;
test.db.database = process.env.DB_TEST_NAME;

// config object for 'test' environment
const prod =  getBase();
test.app.port = parseInt(process.env.PORT, 10) || 3000;
test.db.database = process.env.DB_NAME;

// Get config objects for all enviroments
const configs = {
  dev,
  test,
  prod
};

// Export the config according to current environment
module.exports = configs[env];

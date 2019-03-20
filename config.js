require('dotenv').config();

const env = process.env.NODE_ENV || 'dev';

const dev = {
  app: {
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

const test = {
  app: {
    port: parseInt(process.env.TEST_PORT, 10) || 4000,
    secret: 'secret',
  },
  db: {
    database: process.env.DB_TEST_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
};

const config = {
  dev,
  test,
};

module.exports = config[env];

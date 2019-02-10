require('dotenv').config()

const env = process.env.NODE_ENV || 'dev';

const dev = {
  app: {
    port: parseInt(process.env.PORT) || 3000
  },
  db: {
    name: process.env.DB_NAME || 'clearn',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
  }
}

config = {
  dev,
  test: dev
}

module.exports = config[env];

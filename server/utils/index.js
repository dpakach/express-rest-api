const crypto = require('crypto');
const config = require('../../config');

exports.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    return crypto.createHmac('sha256', config.app.secret).update(str).digest('hex');
  }
  return false;
};

exports.sanitize = (value, type, minLen = null) => {
  if (
    (minLen && typeof value === type && value.length >= minLen)
    || (!minLen && typeof value === type)
  ) {
    return value;
  }
  return false;
};

const crypto = require('crypto');
const config = require('../../config');

/**
 * Function to create sha256 hash of a string
 *
 * @param {string} str
 *
 * @return {string|boolean}
 */
exports.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    return crypto.createHmac('sha256', config.app.secret).update(str).digest('hex');
  }
  return false;
};

/**
 * Function to verify if any variable is valid
 *
 * @param {string} value - the value of the variable
 * @param {string} type - the type that the value should fulfill
 * @param {number} minLen - For strings, the minimum length of the string
 *
 * @return {string|boolean}
 */
exports.sanitize = (value, type, minLen = null) => {
  if (
    (minLen && typeof value === type && value.length >= minLen)
    || (!minLen && typeof value === type)
  ) {
    return value;
  }
  return false;
};

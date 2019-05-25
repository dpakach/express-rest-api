const { Pool } = require('pg');

const { db } = require('../../config');

const pool = new Pool(db);

const dbHandler = {
  query: (text, params, callback) => pool.query(text, params, callback),
};

/**
 * Construct query params from the object
 *
 * @param Object obj
 *
 * @return array[String keys, Array values]
 */
dbHandler.constructQuery = function (obj) {
  const keys = Object.keys(obj);
  const values = keys.map(k => obj[k]);
  return [keys.join(','), values];
};

/**
 * Get placeholder test for query for given values array
 * ['id', 'username'] => [$1, $2]
 *
 * @param Array values
 *
 * @return Array
 */
dbHandler.getValuePlaceholder = function (values) {
  return values.map((_, i) => `$${i + 1}`);
};

/**
 * dbHandler for creating an object
 *
 * @param string tableName
 * @param Object data
 *
 * @return Promise
 */
dbHandler.dbCreate = function (tableName, data) {
  const [keys, values] = dbHandler.constructQuery(data);
  const queryText = `INSERT INTO "${tableName}" (${keys}) VALUES(${dbHandler.getValuePlaceholder(values)});`;
  return dbHandler.query(queryText, values);
};

/**
 * dbHandler for deleting an object
 *
 * @param string tableName
 * @param string id
 *
 * @return Promise
 */
dbHandler.dbRemove = function (tableName, id) {
  const queryText = `DELETE FROM "${tableName}" WHERE id LIKE $1;`;
  return dbHandler.query(queryText, [id]);
};

/**
 * dbHandler for updating an object
 *
 * @param string tableName
 * @param string id
 * @param Object data
 *
 * @return Promise
 */
dbHandler.dbUpdate = function (tableName, id, data) {
  const values = dbHandler.constructQuery(data)[1];
  const updateValues = Object.keys(data).map((k, i) => `${k}=$${i + 1}`);
  const queryText = `UPDATE "${tableName}" SET ${updateValues.join(',')} where id like $${updateValues.length + 1}`;
  return dbHandler.query(queryText, [...values, id]);
};

/**
 * dbHandler for updating an object with multiple selectors
 *
 * @param string tableName
 * @param Object selectors
 * @param Object data
 *
 * @return Promise
 */
dbHandler.dbUpdateSelector = function (tableName, selectors, data) {
  const values = dbHandler.constructQuery(data)[1];
  const updateValues = Object.keys(data).map((k, i) => `${k} = $${i + 1}`);
  const selectorText = Object.keys(selectors).map((s, i) => `${s} = $${i + 1 + updateValues.length}`).join(' and ');
  const queryText = `UPDATE "${tableName}" SET ${updateValues.join(',')} where ${selectorText};`;
  return dbHandler.query(queryText, values.concat(Object.keys(selectors).map(k => selectors[k])));
};

/**
 * dbHandler for reading an object
 *
 * @param string tableName
 * @param string id
 * @param Array values
 *
 * @return Promise
 */
dbHandler.dbRead = function (tableName, id, values) {
  let queryValues = '';
  if (!values) {
    queryValues = '*';
  } else {
    queryValues = values.join(',');
  }
  const queryText = `SELECT ${queryValues} from "${tableName}" where id like $1;`;
  return dbHandler.query(queryText, [id]);
};

/**
 * dbHandler for reading an object with multiple selectors
 *
 * @param string tableName
 * @param Object selectors
 * @param Array selectorValues
 *
 * @return Promise
 */
dbHandler.dbReadSelectors = function (tableName, selectors, selectorValues) {
  let queryValues = '';
  if (!selectorValues) {
    queryValues = '*';
  } else {
    queryValues = selectorValues.join(',');
  }
  const values = Object.keys(selectors).map(k => selectors[k]);
  const selectorText = Object.keys(selectors).map((s, i) => `${s} LIKE $${i + 1}`).join(' AND ');
  const queryText = `SELECT ${queryValues} FROM ${tableName} WHERE ${selectorText}`;
  return dbHandler.query(queryText, values);
};

// Export the handler
module.exports = dbHandler;

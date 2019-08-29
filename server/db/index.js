const { Pool } = require('pg');

const { db } = require('../../config');

const pool = new Pool(db);

const dbHandler = {
  query: (text, params, callback) => pool.query(text, params, callback),
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
  const keys = Object.keys(data).join(',');
  const values = Object.keys(data).map((k) => data[k]);
  const valuesPlaceholder = values.map((_, i) => `$${i + 1}`).join(',');
  const queryText = `INSERT INTO "${tableName}" (${keys}) VALUES(${valuesPlaceholder});`;
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
  const values = Object.keys(data).map((k) => data[k]);
  const updateValues = Object.keys(data).map((k, i) => `${k}=$${i + 1}`).join(',');
  const queryText = `UPDATE "${tableName}" SET ${updateValues} where id like $${values.length + 1}`;
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
  const updateValues = Object.keys(data).map((k) => data[k]);
  const selectorValues = Object.keys(selectors).map((k) => selectors[k]);
  const updateText = Object.keys(data).map((k, i) => `${k} = $${i + 1}`).join(',');
  const selectorText = Object.keys(selectors).map((s, i) => `${s} = $${i + 1 + updateValues.length}`).join(' and ');
  const queryText = `UPDATE "${tableName}" SET ${updateText} where ${selectorText};`;
  return dbHandler.query(queryText, updateValues.concat(selectorValues));
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
 * @param Array values
 *
 * @return Promise
 */
dbHandler.dbReadSelectors = function (tableName, selectors, values) {
  let queryValues = '';
  if (!values) {
    queryValues = '*';
  } else {
    queryValues = values.join(',');
  }
  const selectorValues = Object.keys(selectors).map((k) => selectors[k]);
  const selectorText = Object.keys(selectors).map((s, i) => `${s} LIKE $${i + 1}`).join(' AND ');
  const queryText = `SELECT ${queryValues} FROM ${tableName} WHERE ${selectorText}`;
  return dbHandler.query(queryText, selectorValues);
};

// Export the handler
module.exports = dbHandler;

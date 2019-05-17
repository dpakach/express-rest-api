/**
 * Handler for post related features
 *
 */

// Require dependencies
const uuid = require('uuid/v4');

const { query } = require('../db');
const { sanitize } = require('../utils');
const { getUserById } = require('./userHandler');

// create post handler object
const postHandler = {};

/**
 * function go get post info from the id
 *
 * @param string id
 * @param function callback(error, data)
 */
const getPostById = (postId, callback) => {
  const id = sanitize(postId, 'string');
  if (id) {
    const queryText = 'SELECT id, author, title, content, created, modified FROM posts where id like $1';
    const values = [id];
    query(queryText, values, (err, response) => {
      if (!err && response.rows[0]) {
        const data = response.rows[0];
        getUserById(data.author, (err, user) => {
          if (!err && user) {
            data.author = user;
            callback(false, response.rows[0]);
          } else {
            callback('Error while retriving data');
          }
        });
      } else {
        callback('Unable to find post.');
      }
    });
  } else {
    callback('Missing required values.');
  }
};

/**
 * function to get all posts for given user
 *
 * @param function callback(error, data)
 */
postHandler.getPosts = (userId, callback) => {
  const user = sanitize(userId, 'string');
  if (user) {
    const queryText = 'SELECT id, author, title, content, created, modified FROM posts where author like $1';
    const values = [user];
    query(queryText, values, (err, response) => {
      if (!err && response.rows[0]) {
        callback(200, response.rows);
      } else {
        callback(404, 'Unable to find post.');
      }
    });
  } else {
    callback(400, 'Missing required values.');
  }
};

/**
 * Handler for returning one post
 *
 * @param string id
 * @param function callback(status, data)
 */
postHandler.getPostHandler = (id, callback) => {
  getPostById(id, (err, post) => {
    if (!err) {
      callback(200, post);
    } else {
      callback(404, { Error: err });
    }
  });
};

/**
 * Handler for creating post
 *
 * @param object data, an object containing post data
 * @param function callback(status, data)
 */
postHandler.createPost = (user, data, callback) => {
  const author = sanitize(user, 'string', 6);
  const id = uuid();
  const title = sanitize(data.title, 'string');
  const created = String(Date.now());
  const content = sanitize(data.content, 'string');
  if (author && id && title && created && content) {
    const queryText = 'INSERT INTO "posts"("id", "author", "content", "title", "created", "modified") VALUES($1, $2, $3, $4, $5, $5)';
    const values = [id, author, content, title, created];
    query(queryText, values, (err) => {
      if (!err) {
        getPostById(id, (err, data) => {
          if (!err && data) {
            callback(200, false, data);
          } else {
            callback(500, { Error: 'Error while reading post' });
          }
        });
      } else {
        callback(400, { Error: 'Error writing in database!' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values.' });
  }
};

/**
 * Handler for editing post
 *
 * @param object data, an object containing post data
 * @param function callback(status, data)
 */
postHandler.updatePost = (postId, data, callback) => {
  const id = sanitize(postId, 'string');
  let title = sanitize(data.title, 'string');
  let content = sanitize(data.content, 'string');
  if (id && (title || content)) {
    getPostById(id, (err, post) => {
      if (!err && post) {
        title = title || data.title;
        content = content || data.content;
        const modified = String(Date.now());
        const queryText = 'UPDATE posts SET title = $1, content = $2, modified = $3 WHERE id like $4';
        const values = [title, content, modified, id];
        query(queryText, values, (err) => {
          if (!err) {
            callback(200, false);
          } else {
            callback(400, { Error: 'Error writing in database!' });
          }
        });
      } else {
        callback(404, { Error: 'Unable to find the Post' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values.' });
  }
};

/**
 * Handler for deleting post
 *
 * @param id
 * @param function callback(status, data)
 */
postHandler.deletePost = (postId, callback) => {
  const id = sanitize(postId, 'string');
  if (id) {
    getPostById(id, (err, post) => {
      if (!err && post) {
        const queryText = 'DELETE FROM  posts WHERE id like $1';
        const values = [id];
        query(queryText, values, (err) => {
          if (!err) {
            callback(200, false);
          } else {
            callback(400, { Error: 'Error deleting from database!' });
          }
        });
      } else {
        callback(404, { Error: 'Unable to find the Post' });
      }
    });
  } else {
    callback(400, { Error: 'Missing required values.' });
  }
};

postHandler.getPostById = getPostById;

// Export the controller
module.exports = postHandler;

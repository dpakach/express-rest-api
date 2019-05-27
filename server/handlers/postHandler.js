/**
 * Handler for post related features
 *
 */

// Require dependencies
const uuid = require('uuid/v4');

const {
  dbCreate, dbRemove, dbRead, dbUpdate, dbReadSelectors,
} = require('../db');
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
    dbRead('posts', id, ['id', 'author', 'title', 'content', 'created', 'modified'])
      .then((res) => {
        const data = res.rows[0];
        getUserById(data.author, (err, user) => {
          if (!err && user) {
            data.author = user;
            callback(false, res.rows[0]);
          } else {
            callback('Error while retriving data');
          }
        });
      }).catch(() => {
        callback('Unable to find post.');
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
    dbReadSelectors('posts', { author: user }, ['id', 'author', 'title', 'content', 'created', 'modified'])
      .then((res) => {
        callback(200, res.rows);
      }).catch(() => {
        callback(404, 'Unable to find post.');
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
    dbCreate('posts', {
      author, id, content, title, created, modified: created,
    })
      .then(() => {
        getPostById(id, (err, data) => {
          if (!err && data) {
            callback(200, false, data);
          } else {
            callback(500, { Error: 'Error while reading post' });
          }
        });
      }).catch(() => {
        callback(500, { Error: 'Error writing in database!' });
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
        dbUpdate('posts', id, { title, content, modified })
          .then(() => {
            getPostById(id, (err, data) => {
              if (!err && data) {
                callback(200, false, data);
              } else {
                callback(500, { Error: 'Error while reading post' });
              }
            });
          })
          .catch(() => {
            callback(500, { Error: 'Error writing in database!' });
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
        dbRemove('posts', id)
          .then(() => {
            callback(200, false);
          }).catch(() => {
            callback(400, { Error: 'Error deleting from database!' });
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

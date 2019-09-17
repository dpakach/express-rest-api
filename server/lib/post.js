/**
 * Handler for post related features
 *
 */

// Require dependencies
const uuid = require('uuid/v4');

const {
  dbCreate, dbRemove, dbRead, dbUpdate, dbReadSelectors,
} = require('../db');
const {sanitize} = require('../utils');
const {getUserById} = require('./user');

// create post handler object
const postHandler = {};

/**
 * function go get post info from the id
 *
 * @param string id
 */
const getPostById = (postId) => {
  const id = sanitize(postId, 'string');
  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('Missing required values.'));
    }
    dbRead('posts', id, ['id', 'author', 'title', 'content', 'created', 'modified', 'parent'])
      .then((res) => {
        if (res.rows.length) {
          const data = res.rows[0];
          getUserById(data.author)
            .then((user) => {
              data.author = user;
              resolve(data);
            }).catch((err) => {
              reject(err);
            });
        } else {
          resolve();
        }
      }).catch((err) => {
        reject(err);
      });
  });
};

/**
 * function to get all child posts (replies) for a post
 *
 * @param string postId
 * @param Number limit  - Limit for number of childs in one level
 * @param Number depthLimit  - Limit for how deep to look for child posts
 * @param Number depth - Recusion depth value for breaking recursion
 *
 * @return Promise
 */
const getChildPosts = (postId, limit = 3, depthLimit = 3, depth = 1) => {
  if (depth > depthLimit) {
    return Promise.resolve([]);
  }
  const id = sanitize(postId, 'string');
  const promises = [];
  let data = [];

  return dbReadSelectors('posts', {parent: id})
    .then((res) => {
      data = res.rows.slice(0, limit);
      return data.forEach((post, index) => {
        promises.push(getUserById(post.author)
          .then((user) => {
            data[index].author = user;
          })
          .then(() => getChildPosts(post.id, limit, depthLimit, depth + 1))
          .then((child) => {
            [data[index].children] = child;
            return data[index];
          }));
      });
    })
    .then(() => Promise.all(promises));
};

/**
 * function to get a post with its child posts (replies) for a post
 *
 * @param string postId
 * @param Number limit  - Limit for number of childs in one level
 * @param Number depth  - Limit for how deep to look for child posts
 *
 * @return Promise
 */
const getPostWithChilds = (postId, limit = 3, depth = 0) => {
  const id = sanitize(postId, 'string');

  return new Promise((resolve, reject) => {
    if (!id) {
      reject(new Error('Missing required values.'));
    }
    dbRead('posts', id)
      .then((res) => {
        const data = res.rows;
        if (data.length) {
          data.forEach((post, index) => {
            getUserById(post.author)
              .then((user) => {
                data[index].author = user;
              })
              .then(() => getChildPosts(post.id, limit, depth))
              .then((child) => {
                [data[index].children] = child;
                resolve(data[0]);
              })
              .catch((err) => reject(err));
          });
        } else {
          resolve();
        }
      }).catch((err) => {
        reject(err);
      });
  });
};

/**
 * function to get all posts for given user
 */
const getPostsForUser = (userId, limit = 3, depth = 0) => {
  const user = sanitize(userId, 'string');

  const promises = [];

  if (!user) {
    Promise.reject(new Error('Missing required values.'));
  }
  return dbReadSelectors('posts', {author: user})
    .then((res) => {
      let data = res.rows;
      data = data.filter((post) => post.parent === null);
      if (!data.length) {
        return [];
      }
      return data.forEach((post, index) => {
        promises.push(
          getUserById(post.author)
            .then((user) => {
              data[index].author = user;
            })
            .then(() => getChildPosts(post.id, limit, depth))
            .then((child) => {
              data[index].children = child;
              return data[index];
            }),
        );
      });
    })
    .then(() => Promise.all(promises));
};

/**
 * Handler for creating post
 *
 * @param object data, an object containing post data
 * @param function callback(status, data)
 */
postHandler.createPost = (user, data) => {
  const author = sanitize(user, 'string', 6);
  const id = uuid();
  const title = sanitize(data.title, 'string');
  const created = String(Date.now());
  const content = sanitize(data.content, 'string');
  const parent = data.parent || null;

  if (!(author && id && title && created && content)) {
    return Promise.reject(new Error('Missing required values'));
  }
  return dbCreate('posts', {
    author, id, content, title, created, parent, modified: created,
  })
    .then(() => getPostById(id));
};

/**
 * Handler for editing post
 *
 * @param object data, an object containing post data
 */
postHandler.updatePost = (postId, data) => {
  const id = sanitize(postId, 'string');
  let title = sanitize(data.title, 'string');
  let content = sanitize(data.content, 'string');
  if (!id || (!title && !content)) {
    return Promise.reject(new Error('Missing required values'));
  }
  return getPostById(id)
    .then((post) => {
      title = title || data.title;
      content = content || data.content;
      const modified = String(Date.now());
      return dbUpdate('posts', post.id, {title, content, modified});
    })
    .then(() => getPostById(id));
};

/**
 * Handler for deleting post
 *
 * @param id
 */
postHandler.deletePost = (postId) => {
  const id = sanitize(postId, 'string');
  if (!id) {
    return Promise.reject(new Error('Missing required values'));
  }
  return getPostById(id)
    .then((post) => dbRemove('posts', post.id));
};

postHandler.getPostById = getPostById;
postHandler.getPostsForUser = getPostsForUser;
postHandler.getPostWithChilds = getPostWithChilds;

// Export the controller
module.exports = postHandler;

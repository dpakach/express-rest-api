const {
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsForUser,
  getPostWithChilds
} = require('../modules/post');
const { sanitize } = require('../utils');

const postController = {};

/**
 * Handler for creating post
 */
postController.postPost = (req, res, next) => {
  data = req.body
  const title = sanitize(data.title, 'string');
  const content = sanitize(data.content, 'string');
  const parent = sanitize(data.parent, 'string');

  if(!(title && content)) {
    res.status(400).json({Error: 'missing required values'}).end();
  } else {
    createPost(req.user_id, {title, content, parent})
      .then(data => {
        res.status(200).json(data).end();
      }).catch(next);
  }
};

/**
 * Handler getting all posts by a user
 */
postController.getPosts = (req, res, next) => {
  const depth = Number(req.query.depth) || 0;
  const limit = Number(req.query.limit) || 3;
  getPostsForUser(req.user_id, limit, depth)
    .then(data => {
      res.status(400).json(data).end();
    }).catch(next)
};

/**
 * Handler for returning one post
 */
postController.getPost = (req, res, next) => {
  const depth = Number(req.query.depth) || 0;
  const limit = Number(req.query.limit) || 3;
  getPostWithChilds(req.params.id, depth, limit)
    .then(post => {
      if(!post) {
        return res.status(404).end();
      } else {
        return res.status(200).json(post).end();
      }
    })
    .catch(next);
};

/**
 * Handler for updating post
 */
postController.putPost = (req, res, next) => {
  getPostById(req.params.id)
    .then(post => {
      if(!post) {
        return res.status(404).end();
      } else {
        return updatePost(req.params.id, req.body)
        .then((data) => res.status(200).json(data).end())
      }
    })
    .catch(next);
};

/**
 * Handler for updating post
 */
postController.deletePost = (req, res, next) => {
  getPostById(req.params.id)
    .then(post => {
      if(!post) {
        return res.status(404).end();
      } else {
        return deletePost(req.params.id)
        .then(() => res.status(200).end())
      }
    })
    .catch(next);
};

// Export the controller
module.exports = postController;

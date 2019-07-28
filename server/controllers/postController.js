const {
  createPost,
  getPostHandler,
  deletePost,
  updatePost,
  getPosts,
} = require('../handlers/postHandler');

const postController = {};

/**
 * Handler for creating post
 */
postController.postPost = (req, res) => {
  createPost(req.user_id, req.body, (status = 200, err, data) => {
    if (!err) {
      res.status(status).json(data).end();
    } else {
      res.status(status).json(err).end();
    }
  });
};

/**
 * Handler getting all posts by a user
 */
postController.getPosts = (req, res) => {
  getPosts(req.user_id, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

/**
 * Handler for returning one post
 */
postController.getPost = (req, res) => {
  const depth = Number(req.query.depth) || 0;
  const limit = Number(req.query.limit) || 3;
  getPostHandler(req.params.id, depth, limit, (status = 200, data) => {
    if (req.post === data.postname) {
      res.status(status).json(data).end();
    } else {
      res.status(404).end();
    }
  });
};

/**
 * Handler for updating post
 */
postController.putPost = (req, res) => {
  updatePost(req.params.id, req.body, (status = 200, err, data) => {
    if (!err) {
      res.status(status).json(data).end();
    } else {
      res.status(status).json(err).end();
    }
  });
};

/**
 * Handler for updating post
 */
postController.deletePost = (req, res) => {
  deletePost(req.params.id, (status = 200, data) => {
    res.status(status).json(data).end();
  });
};

// Export the controller
module.exports = postController;

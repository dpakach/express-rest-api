const {
  createUser,
  getUserById,
  changePassword,
} = require('../handlers/userHandler');

const userController = {};

/**
 * Handler for creating user
 */
userController.postUser = (req, res) => {
  createUser(req.body, (err, status = 200) => {
    if (!err) {
      res.status(status).end();
    } else {
      res.status(status).end(err);
    }
  });
};

/**
 * Handler for returning one user
 */
userController.getUser = (req, res) => {
  getUserById(req.params.id, (err, status = 200, data) => {
    if (!err) {
      res
        .status(status)
        .json(data)
        .end();
    } else {
      res.status(status).end(err);
    }
  });
};

/**
 * Handler for changing password
 */
userController.postUserPassword = (req, res) => {
  changePassword(req.params.id, req.body, (err, status = 200) => {
    if (!err) {
      res.status(status).end();
    } else {
      res.status(status).end(err);
    }
  });
};

// Export the controller
module.exports = userController;

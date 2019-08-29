const {
  createUser,
  getUserById,
  changePassword,
} = require('../lib/user');

const userController = {};

/**
 * Handler for creating user
 */
userController.postUser = (req, res, next) => {
  createUser(req.body)
    .then(() => {
      res.status(200).end();
    }).catch(next);
};

/**
 * Handler for returning one user
 */
userController.getUser = (req, res, next) => {
  getUserById(req.params.id)
    .then((user) => {
      if (!user) {
        return res.status(404).end();
      }
      return res.status(200).json(user).end();
    }).catch(next);
};

/**
 * Handler for changing password
 */
userController.postUserPassword = (req, res, next) => {
  changePassword(req.params.id, req.body)
    .then(() => {
      res.status(200).end();
    }).catch(next);
};

// Export the controller
module.exports = userController;

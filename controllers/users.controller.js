const {
  fetchUsers,
  fetchUsersByUsername,
  createUser,
  removeUser,
} = require("../models/users.model");

exports.getUsers = (req, res, next) => {
  fetchUsers().then((users) => {
    res.status(200).send({ users });
  });
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;
  fetchUsersByUsername(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postUser = (req, res, next) => {
  const { username, name, avatar_url } = req.body;

  if (
    !username ||
    !name ||
    (!avatar_url && Object.keys(req.body).length !== 2) ||
    (avatar_url && Object.keys(req.body).length !== 3)
  ) {
    return next({ status: 400, msg: "request body incorrect" });
  }
  createUser(username, name, avatar_url)
    .then((user) => {
      res.status(201).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

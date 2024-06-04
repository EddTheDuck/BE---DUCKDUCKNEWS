const {
  getUsers,
  getUserByUsername,
  postUser,
  deleteUser,
} = require("../controllers/users.controller");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);
usersRouter.post("/", postUser);
usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;

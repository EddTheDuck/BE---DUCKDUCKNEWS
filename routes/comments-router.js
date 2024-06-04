const {
  patchCommentByID,
  deleteCommentByID,
} = require("../controllers/comments.controller");

const commentsRouter = require("express").Router();

commentsRouter.patch("/:comment_id", patchCommentByID);
commentsRouter.delete("/:comment_id", deleteCommentByID);

module.exports = commentsRouter;

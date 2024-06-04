const {
  fetchCommentsByArticleID,
  createComment,
  removeComment,
  modifyComment,
} = require("../models/comments.model");
const { fetchUsersByUsername } = require("../models/users.model");

exports.getCommentsByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, p } = req.query;
  if (p < 1) {
    return next({ status: 400, msg: "request included invalid format" });
  }
  fetchCommentsByArticleID(article_id, limit, p)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  if (
    username === undefined ||
    body === undefined ||
    Object.keys(req.body).length !== 2
  ) {
    return next({ status: 400, msg: "post request incorrect" });
  }
  createComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentByID = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentByID = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  if (inc_votes === undefined || Object.keys(req.body).length > 1) {
    return next({ status: 400, msg: "request body incorrect" });
  }

  modifyComment(comment_id, inc_votes)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

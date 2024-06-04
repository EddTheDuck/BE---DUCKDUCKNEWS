const express = require("express");

const {
  getArticleById,
  patchArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  postArticle,
  deleteArticleById,
} = require("../controllers/articles.controllers");

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);

articlesRouter.patch("/:article_id", patchArticleById);

articlesRouter.post("/", postArticle);
articlesRouter.post("/:article_id/comments", postCommentByArticleId);

articlesRouter.delete("/:article_id", deleteArticleById);

module.exports = articlesRouter;

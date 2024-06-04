const {
  getArticles,
  getArticleByID,
  postArticle,
  patchArticleByID,
  deleteArticle,
} = require("../controllers/articles.controller");
const {
  getCommentsByArticleID,
  postCommentByArticleID,
} = require("../controllers/comments.controller");

const articlesRouter = require("express").Router();

articlesRouter.get("/", getArticles);
articlesRouter.post("/", postArticle);
articlesRouter.get("/:article_id", getArticleByID);
articlesRouter.patch("/:article_id", patchArticleByID);
articlesRouter.delete("/:article_id", deleteArticle);
articlesRouter.get("/:article_id/comments", getCommentsByArticleID);
articlesRouter.post("/:article_id/comments", postCommentByArticleID);

module.exports = articlesRouter;

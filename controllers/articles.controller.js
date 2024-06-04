const {
  fetchArticleByID,
  fetchArticles,
  modifyArticle,
  createArticle,
  removeArticle,
} = require("../models/articles.model");
const { fetchTopics } = require("../models/topics.model");

exports.getArticleByID = (req, res, next) => {
  const articleID = req.params.article_id;
  fetchArticleByID(articleID)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order, limit, p } = req.query;
  if (+p < 1) {
    return next({ status: 400, msg: "request included invalid format" });
  }
  const promises = [fetchArticles(topic, sort_by, order, limit, p)];
  if (topic) {
    promises.push(fetchTopics(topic));
  }
  Promise.all(promises)
    .then(([articles]) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleByID = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  if (inc_votes === undefined || Object.keys(req.body).length > 1) {
    return next({ status: 400, msg: "request body incorrect" });
  }
  modifyArticle(article_id, inc_votes)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;

  if (
    !author ||
    !title ||
    !body ||
    !topic ||
    (!article_img_url && Object.keys(req.body).length !== 4) ||
    (article_img_url && Object.keys(req.body).length !== 5)
  ) {
    return next({ status: 400, msg: "request body incorrect" });
  }
  createArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      article.comment_count = 0;
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  removeArticle(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

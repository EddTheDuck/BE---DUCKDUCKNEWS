const { fetchTopics, createTopic } = require("../models/topics.model");
const endpoints = require("../endpoints.json");

exports.getTopics = (req, res, next) => {
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints });
};

exports.postTopic = (req, res, next) => {
  const { slug, description } = req.body;

  if (
    slug === undefined ||
    description === undefined ||
    Object.keys(req.body).length !== 2
  ) {
    return next({ status: 400, msg: "request body incorrect" });
  }

  createTopic(slug, description)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
};

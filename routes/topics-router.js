const { getTopics, postTopic } = require("../controllers/topics.controller");

const topicRouter = require("express").Router();

topicRouter.get("/", getTopics);
topicRouter.post("/", postTopic);

module.exports = topicRouter;

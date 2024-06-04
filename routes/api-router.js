const { getEndpoints } = require("../controllers/topics.controller");
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");

const apiRouter = require("express").Router();
const topicRouter = require("./topics-router");
const usersRouter = require("./users-router");

apiRouter.get("/", getEndpoints);
apiRouter.use("/topics", topicRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;

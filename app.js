const express = require("express");
const apiRouter = require("./routers/app.router");

const {
  handleCustomErrors,
  handlePsqlErrors,
  handleServerErrors,
  handle404s,
} = require("./errors/errors");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", handle404s);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);

module.exports = app;

const express = require("express");

const {
  invalidPath,
  handleCustomErrors,
  handlePSQLErrors,
  handle500Errors,
} = require("./controllers/errors.controller");
const apiRouter = require("./routes/api-router");

const app = express();

//connection to allow connections

//middleware connections
app.use(express.json());

//middleware routes
app.use("/api", apiRouter);

//error handling

app.use(handleCustomErrors);
app.use(handlePSQLErrors);
app.use(handle500Errors);

//invalid path catcher
app.use("/*", invalidPath);

module.exports = app;

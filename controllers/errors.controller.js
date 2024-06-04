exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }
  next(err);
};

exports.handlePSQLErrors = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "request included invalid format" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "1 or more properties not found" });
  } else if (err.code === "23505") {
    res.status(400).send({ msg: "key already exists" });
  }
  next(err);
};

exports.invalidPath = (req, res, next) => {
  res.status(404).send({ msg: "invalid path" });
};

exports.handle500Errors = (err, req, res, next) => {
  res.status(500).send({ message: "internal server error!!" });
};

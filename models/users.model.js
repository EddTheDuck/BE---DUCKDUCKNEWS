const db = require("../db/connection");

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users;").then(({ rows }) => {
    return rows;
  });
};

exports.fetchUsersByUsername = (username) => {
  return db
    .query(
      `
    SELECT * FROM users
    WHERE username = $1;`,
      [username]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "user not found" });
      } else {
        return result.rows[0];
      }
    });
};

exports.createUser = (username, name, avatar_url) => {
  return db
    .query(
      `
 INSERT INTO users
 (username, name, avatar_url)
 VALUES
 ($1, $2, $3)
 RETURNING *;`,
      [username, name, avatar_url]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

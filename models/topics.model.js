const db = require("../db/connection");

exports.fetchTopics = (topic) => {
  let query = "SELECT * FROM topics";
  const values = [];
  if (topic) {
    query += " WHERE slug = $1;";
    values.push(topic);
  }
  return db.query(query, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "topic not found" });
    }
    return rows;
  });
};

exports.createTopic = (slug, description) => {
  return db
    .query(
      `
    INSERT INTO topics
    (slug, description)
    VALUES
    ($1, $2)
    RETURNING *;`,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

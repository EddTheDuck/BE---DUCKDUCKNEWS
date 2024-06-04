const db = require("../db/connection");

exports.fetchCommentsByArticleID = (article_id, limit = 10, p = 1) => {
  const values = [article_id, limit];
  const query = `SELECT * FROM comments WHERE article_ID = $1 ORDER BY created_at DESC
 LIMIT $2 OFFSET $3;`;
  const pageNum = (+p - 1) * +limit;
  values.push(pageNum);
  return db.query(query, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "no article(s) found" });
    }
    return rows;
  });
};

exports.createComment = (articleID, username, body) => {
  const query = `
    INSERT INTO comments
    (article_id, author, body)
    VALUES
    ($1, $2, $3)
    RETURNING *
    ;`;
  return db.query(query, [articleID, username, body]).then(({ rows }) => {
    return rows[0];
  });
};

exports.removeComment = (comment_id) => {
  const query = `
   DELETE FROM comments
   WHERE comment_id = $1
   RETURNING *;`;
  return db.query(query, [comment_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "comment not found" });
    }
  });
};

exports.modifyComment = (comment_id, inc_votes) => {
  const query = `
  UPDATE comments
  SET votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;
  `;
  return db.query(query, [inc_votes, comment_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "comment not found" });
    }
    return rows[0];
  });
};

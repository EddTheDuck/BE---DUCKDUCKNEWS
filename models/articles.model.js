const db = require("../db/connection");

exports.fetchArticleByID = (articleID) => {
  const query =
    "SELECT articles.author, title, articles.body, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) AS comment_count FROM articles FULL OUTER JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id ORDER BY articles.created_at DESC;";
  return db.query(query, [articleID]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "article does not exist" });
    }
    return rows[0];
  });
};

exports.fetchArticles = (
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) => {
  const validSortBys = {
    article_id: "article_id",
    title: "title",
    topic: "topic",
    author: "author",
    body: "body",
    created_at: "created_at",
    votes: "votes",
    article_img_url: "article_img_url",
    comment_count: "comment_count",
  };
  const validOrders = {
    asc: "ASC",
    desc: "DESC",
  };
  if (!(order in validOrders)) {
    return Promise.reject({ status: 400, msg: "invalid order query" });
  }
  if (!(sort_by in validSortBys)) {
    return Promise.reject({ status: 400, msg: "invalid sort_by query" });
  }
  const values = [];
  let query = `SELECT count(*) OVER() AS total_count, articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) AS comment_count FROM articles FULL OUTER JOIN comments ON comments.article_id = articles.article_id`;

  if (topic) {
    query += ` WHERE topic = $${values.length + 1}`;
    values.push(topic);
  }
  query += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order} 
 LIMIT $${values.length + 1} OFFSET $${values.length + 2};`;

  const pageNum = (+p - 1) * +limit;
  values.push(limit, pageNum);

  return db.query(query, values).then(({ rows }) => {
    return rows;
  });
};

exports.modifyArticle = (articleID, inc_votes) => {
  const query = `
 UPDATE articles
 SET votes = votes + $1
 WHERE article_id = $2
 RETURNING *;
 `;
  return db.query(query, [inc_votes, articleID]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "article not found" });
    }
    return rows[0];
  });
};

exports.createArticle = (author, title, body, topic, article_img_url) => {
  const query = `
 INSERT INTO articles
 (author, title, body, topic${article_img_url ? ", article_img_url" : ""})
 VALUES
 ($1, $2, $3, $4${article_img_url ? ", $5" : ""})
 RETURNING *;`;
  const values = [author, title, body, topic];

  if (article_img_url) {
    values.push(article_img_url);
  }
  return db.query(query, values).then(({ rows }) => {
    return rows[0];
  });
};

exports.removeArticle = (article_id) => {
  return db
    .query(
      `
 DELETE FROM comments
 WHERE article_id = $1;`,
      [article_id]
    )
    .then(() => {
      return db
        .query(
          `
    DELETE FROM articles
    WHERE article_id = $1
    RETURNING *;`,
          [article_id]
        )
        .then(({ rows }) => {
          if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "not found" });
          }
        });
    });
};

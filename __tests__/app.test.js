const app = require("../app");
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const request = require("supertest");
const seed = require("../db/seeds/seed");
const endPoints = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET: /api/topics", () => {
  test("GET: should respond with a 200 status code", () => {
    return request(app).get("/api/topics").expect(200);
  });
  test("should return an array of objects, all with correct properties", () => {
    return request(app)
      .get("/api/topics")
      .then(({ body }) => {
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(typeof topic.description).toBe("string");
          expect(typeof topic.slug).toBe("string");
        });
      });
  });
});
describe("ANY: request to invalid path", () => {
  test("should respond with a 404 error and message when attempt to access invalid path", () => {
    return request(app)
      .get("/api/notapath")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid path");
      });
  });
});
describe("GET: /api", () => {
  test("should respond with a 200 status code", () => {
    return request(app).get("/api").expect(200);
  });
  test("should respond with an object with all available endpoints on the API", () => {
    return request(app)
      .get("/api")
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endPoints);
      });
  });
});
describe("GET: /api/articles/:article_id", () => {
  test("should respond with a 200 status code and article object", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z", //T seperates time and date, 000Z is offset from UTC
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        );
      });
  });
  test("should respond with 400 status and an appropriate error when an id that doesnt exist is requested", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
  test("should respond with 400 status and appropriate error when invalid id type is requested", () => {
    return request(app)
      .get("/api/articles/notanumber")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
});
describe("GET: /api/articles", () => {
  test("should respond with 200 status code and array of objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        body.articles.forEach((article) => {
          expect(article.body).toBe(undefined);
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});
describe("GET: /api/articles/article:id/comments", () => {
  test("should respond with 200 status code and an array of correct comment objects in correct order", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(2);
        body.comments.forEach((comment) => {
          expect(comment.article_id).toBe(3);
        });
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should respond with 400 error when passed a bad request", () => {
    return request(app)
      .get("/api/articles/numberthree/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with 404 status and the correct error when no article_id match is found", () => {
    return request(app)
      .get("/api/articles/999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("no article(s) found");
      });
  });
});
describe("POST: /api/articles/:article_id/comments", () => {
  test("should respond with 201 status and newly created comment", () => {
    const testComment = {
      username: "lurker",
      body: "Wow this is incredible",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(testComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: 19,
            body: "Wow this is incredible",
            article_id: 11,
            author: "lurker",
            votes: 0,
            created_at: expect.any(String),
          })
        );
      });
  });
  test("should respond with 400 status and an appropriate error when additional un-needed properties are passed", () => {
    const testComment = {
      username: "lurker",
      body: "Wow this is incredible",
      lovesChocolate: true,
      SQLInjection: "SELECT * FROM users;",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("post request incorrect");
      });
  });
  test("should respond with 400 status and an error when passed a bad request for article_id", () => {
    const testComment = { username: "lurker", body: "Wow this is incredible" };
    return request(app)
      .post("/api/articles/eleven/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with 404 status and an error when passed an article_id not matching in the DB", () => {
    const testComment = { username: "lurker", body: "Wow this is incredible" };
    return request(app)
      .post("/api/articles/999/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("1 or more properties not found");
      });
  });
  test("should respond with 404 status and appropriate error when username does not exist, but valid article_id is passed", () => {
    const testComment = {
      username: "bananaman",
      body: "Wow this is incredible",
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(testComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("1 or more properties not found");
      });
  });
  test("should respond with 400 status and an error when one or more of the required keys are missing", () => {
    const testComment = {
      body: "Loved it!",
      votes: 200,
    };
    return request(app)
      .post("/api/articles/11/comments")
      .send(testComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("post request incorrect");
      });
  });
});
describe("PATCH: /api/articles/:article_id", () => {
  test("should respond with 201 status code and the updated article object", () => {
    const testObject = { inc_votes: 20 };
    return request(app)
      .patch("/api/articles/3")
      .send(testObject)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: expect.any(String),
            votes: 20,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
        );
      });
  });
  test("should respond with 400 status and response when passed an incorrect formatted article_id", () => {
    const testObject = { inc_votes: 20 };
    return request(app)
      .patch("/api/articles/three")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with 404 status and response when passed an article_id that doesn't exist", () => {
    const testObject = { inc_votes: 20 };
    return request(app)
      .patch("/api/articles/999")
      .send(testObject)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article not found");
      });
  });
  test("should respond with 400 status and appropriate error when incorrect object is sent to valid article_id", () => {
    const testObject = { bananas: 20 };
    return request(app)
      .patch("/api/articles/3")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with 400 status and appropriate error when object with correct property with additional properties is sent to valid article_id", () => {
    const testObject = { inc_votes: 20, bananas: 20 };
    return request(app)
      .patch("/api/articles/3")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
});
describe("DELETE: /api/comments/:comment_id", () => {
  test("should respond with a 204 status code and no response", () => {
    return request(app)
      .delete("/api/comments/16")
      .expect(204)
      .then(() => {
        return request(app).get("/api/articles/6/comments").expect(404);
      });
  });
  test("should respond with a 400 status and appropriate response when passed an invalid comment_id format", () => {
    return request(app)
      .delete("/api/comments/six")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with a 404 status and appropriate response when passed a comment_id that doesn't exist", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment not found");
      });
  });
});
describe("GET: /api/users", () => {
  test("should respond with a 200 status code and array of objects containing user info", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
});
describe("GET: /api/articles/:article_id(comment_count)", () => {
  test("should respond with a 200 status code and article object", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: 3,
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            created_at: "2020-11-03T09:12:00.000Z",
            votes: 0,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: "2",
          })
        );
      });
  });
  test("should respond with a 400 status code and suitable error message when passed an article_id of wrong format", () => {
    return request(app)
      .get("/api/articles/three")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with a 404 status code and suitable error message when passed an article_id that doesn't exist", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("article does not exist");
      });
  });
});
describe("GET: /api/articles/(topic query)", () => {
  test("should respond with a 200 status code and the correct array of articles", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(1);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });
  test("should respond with 404 status and suitable error message when a topic that is not in the database is passed", () => {
    return request(app)
      .get("/api/articles?topic=bananas")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("topic not found");
      });
  });
  test("should respond with a 200 status code and an empty array when passed an existing topic with no matching data", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toEqual([]);
      });
  });
});
describe("GET: /api/articles(sorting queries)", () => {
  test("should respond with a 200 status code and correct array of articles sorted by specified column defaulting to descending", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("title", { descending: true });
      });
  });
  test("should respond with a 200 status code and correct array of articles sorted by specified column, topic, AND ascending", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(10);
        expect(body.articles).toBeSortedBy("article_id", { ascending: true });
        body.articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("should respond with a 400 status code and suitable response when passed a sort_by query that isnt available", () => {
    return request(app)
      .get("/api/articles?sort_by=bananas")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid sort_by query");
      });
  });
  test("should respond with a 400 status code and suitable response when passed an order query that isnt available", () => {
    return request(app)
      .get("/api/articles?order=hello")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("invalid order query");
      });
  });
});
describe("GET: /api/users/:username", () => {
  test("should respond with 200 status code and correct user object", () => {
    return request(app)
      .get("/api/users/lurker")
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toEqual(
          expect.objectContaining({
            username: "lurker",
            name: "do_nothing",
            avatar_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          })
        );
      });
  });
  test("should respond with 404 status code and appropriate error when passed a username that doesn't exist", () => {
    return request(app)
      .get("/api/users/bananaman")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("user not found");
      });
  });
});
describe("PATCH: /api/comments/:comment_id", () => {
  test("should respond with 201 status code and return updated comment", () => {
    const testObject = { inc_votes: 50 };
    return request(app)
      .patch("/api/comments/4")
      .send(testObject)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: 4,
            body: " I carry a log — yes. Is it funny to you? It is not to me.",
            article_id: 1,
            author: "icellusedkars",
            votes: -50,
            created_at: "2020-02-23T12:01:00.000Z",
          })
        );
      });
  });
  test("should respond with 400 status code and appropriate error when passed a comment_id in the wrong format", () => {
    const testObject = { inc_votes: 50 };
    return request(app)
      .patch("/api/comments/four")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with 404 status code and appropriate error when passed a comment_id not in the database", () => {
    const testObject = { inc_votes: 50 };
    return request(app)
      .patch("/api/comments/999")
      .send(testObject)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("comment not found");
      });
  });
  test("should respond with 400 status and appropriate error when object with incorrect key is sent to valid article_id", () => {
    const testObject = { banana: 50 };
    return request(app)
      .patch("/api/comments/4")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with 400 status and appropriate error when object with correct key but additional keys is sent to valid article_id", () => {
    const testObject = { inc_votes: 50, banana: true };
    return request(app)
      .patch("/api/comments/4")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
});
describe("POST: /api/articles", () => {
  test("should respond with a 201 status and the newly created article object when passed full, correct object", () => {
    const testObject = {
      author: "lurker",
      title: "What to do?",
      body: "Not sure what to do? Me neither...",
      topic: "cats",
      article_img_url: "test",
    };
    return request(app)
      .post("/api/articles")
      .send(testObject)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            author: "lurker",
            title: "What to do?",
            body: "Not sure what to do? Me neither...",
            topic: "cats",
            article_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
            article_img_url: "test",
          })
        );
      });
  });
  test("should respond with a 201 status and the newly created article object when passed everything correct but no article_img_url (defaults to something in DB)", () => {
    const testObject = {
      author: "lurker",
      title: "What to do?",
      body: "Not sure what to do? Me neither...",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(testObject)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            author: "lurker",
            title: "What to do?",
            body: "Not sure what to do? Me neither...",
            topic: "cats",
            article_id: 14,
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          })
        );
      });
  });
  test("should respond with a 400 status and appropriate error when the object posted is incomplete", () => {
    const testObject = {
      title: "What to do?",
      body: "Not sure what to do? Me neither...",
    };
    return request(app)
      .post("/api/articles")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with a 400 status and appropriate error when the object posted is complete, but includes additional keys", () => {
    const testObject = {
      author: "lurker",
      title: "What to do?",
      body: "Not sure what to do? Me neither...",
      topic: "cats",
      bananas: true,
    };
    return request(app)
      .post("/api/articles")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with a 404 error and appropriate error message when topic does not exist in the database", () => {
    const testObject = {
      author: "lurker",
      title: "What to do?",
      body: "Not sure what to do? Me neither...",
      topic: "bananas",
    };
    return request(app)
      .post("/api/articles")
      .send(testObject)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("1 or more properties not found");
      });
  });
  test("should respond with a 404 error and appropriate error message when author does not exist in the database", () => {
    const testObject = {
      author: "banana",
      title: "What to do?",
      body: "Not sure what to do? Me neither...",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(testObject)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("1 or more properties not found");
      });
  });
});
describe("GET /api/articles(pagination)", () => {
  test("should respond with a 200 status and the correct number of results when passed a limit", () => {
    return request(app)
      .get("/api/articles?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(5);
      });
  });
  test("should respond with a 200 status and the correct number of results in correct order when passed a limit, page number, sort_by=article_id and order=asc", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2&sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(5);
        expect(body.articles[0].article_id).toBe(6);
        expect(body.articles).toBeSortedBy("article_id", { ascending: true });
      });
  });
  test("should respond with a 200 status code and include a total_count property that displays the total entries BEFORE limit was applied", () => {
    return request(app)
      .get("/api/articles?limit=5&p=2&sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles[0].total_count).toBe("13");
      });
  });
  test("should respond with a 400 status code and appropriate error when passed wrong format queries for limit", () => {
    return request(app)
      .get("/api/articles?limit=five&p=2&sort_by=article_id&order=asc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with a 400 status code and appropriate error when passed wrong format queries for p", () => {
    return request(app)
      .get("/api/articles?limit=5&p=two&sort_by=article_id&order=asc")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with a 400 status code and appropriate error when passed negative number for p", () => {
    return request(app)
      .get("/api/articles?limit=5&p=-1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
});
describe("POST: /api/topics", () => {
  test("should respond with a 201 status code and the created topic object", () => {
    const testObject = {
      slug: "Jordan",
      description: "Loves testing",
    };
    return request(app)
      .post("/api/topics")
      .send(testObject)
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).toEqual(
          expect.objectContaining({
            slug: "Jordan",
            description: "Loves testing",
          })
        );
      });
  });
  test("should respond with a 400 status code and appropriate error when passed a topic that already exists", () => {
    const testObject = {
      slug: "mitch",
      description: "Loves testing",
    };
    return request(app)
      .post("/api/topics")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("key already exists");
      });
  });
  test("should respond with a 400 status code and appropriate error when passed a correct object with additional keys", () => {
    const testObject = {
      slug: "Jordan",
      description: "Loves testing",
      isBanana: true,
    };
    return request(app)
      .post("/api/topics")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with a 400 status code and appropriate error when passed an incorrect object with correct number of keys", () => {
    const testObject = {
      description: "Loves testing",
      isBanana: true,
    };
    return request(app)
      .post("/api/topics")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with a 400 status code and appropriate error when passed an object with not enough keys", () => {
    const testObject = {
      description: "Loves testing",
    };
    return request(app)
      .post("/api/topics")
      .send(testObject)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
});
describe("DELETE: /api/articles/:article_id", () => {
  test("should respond with a 204 status code and no content, but delete all the comments relating to the passed article before deleting the article", () => {
    return request(app)
      .delete("/api/articles/3")
      .expect(204)
      .then(() => {
        return request(app)
          .get("/api/articles/3")
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("article does not exist");
          });
      });
  });
  test("should respond with a 404 status and appropriate error when passed an article ID that doesn't exist", () => {
    return request(app)
      .delete("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("not found");
      });
  });
  test("should respond with a 400 status and appropriate error when passed an article ID that doesn't fit formatting", () => {
    return request(app)
      .delete("/api/articles/three")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
});
describe("GET: /api/articles/:article_id/comments (pagination)", () => {
  test("should respond with a 200 status code and the correct array of comments", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=5")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(5);
        body.comments.forEach((comment) => {
          expect(comment.article_id).toBe(1);
        });
      });
  });
  test("should respond with a 200 status code and the correct array of comments when passed a limit and page num", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=3&p=3")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(3);
        expect(body.comments[0].body).toBe("I hate streaming eyes even more");
        expect(body.comments[1].body).toBe(
          "Massive intercranial brain haemorrhage"
        );
        expect(body.comments[2].body).toBe(
          "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works."
        );
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("should respond with a 400 status code and appropriate error when passed negative number for p", () => {
    return request(app)
      .get("/api/articles/3/comments?limit=5&p=-1")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with a 400 status and suitable error when passed a limit in the wrong format", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=three&p=3")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
  test("should respond with a 400 status and suitable error when passed a page number in the wrong format", () => {
    return request(app)
      .get("/api/articles/1/comments?limit=3&p=three")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request included invalid format");
      });
  });
});
//Extra
describe("POST: /api/users", () => {
  test("should respond with a 201 status code and the created user object", () => {
    const testUser = {
      username: "Jordan123",
      name: "Jordan",
      avatar_url: "test",
    };
    return request(app)
      .post("/api/users")
      .send(testUser)
      .expect(201)
      .then(({ body }) => {
        expect(body.user).toEqual(
          expect.objectContaining({
            username: "Jordan123",
            name: "Jordan",
            avatar_url: "test",
          })
        );
      });
  });
  test("should respond with a 201 status code and the created user object when passed an object with no avatar_url but the correct other keys (avatar_url can be null)", () => {
    const testUser = {
      username: "Jordan123",
      name: "Jordan",
    };
    return request(app)
      .post("/api/users")
      .send(testUser)
      .expect(201)
      .then(({ body }) => {
        expect(body.user).toEqual(
          expect.objectContaining({
            username: "Jordan123",
            name: "Jordan",
            avatar_url: null,
          })
        );
      });
  });
  test("should respond with a 400 status code and the created user object when passed a random key instead of avatar_url", () => {
    const testUser = {
      username: "Jordan123",
      name: "Jordan",
      banana: true,
    };
    return request(app)
      .post("/api/users")
      .send(testUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual("request body incorrect");
      });
  });
  test("should respond with a 400 status and appropriate error when passed an incomplete object", () => {
    const testUser = {
      username: "Jordan123",
      avatar_url: "test",
    };
    return request(app)
      .post("/api/users")
      .send(testUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with a 400 status and appropriate error when passed a complete object but with wrong keys", () => {
    const testUser = {
      username: "Jordan123",
      avatar_url: "test",
      banana: true,
    };
    return request(app)
      .post("/api/users")
      .send(testUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("request body incorrect");
      });
  });
  test("should respond with a 400 status and appropriate error when passed a username that already exists in the DB", () => {
    const testUser = {
      username: "lurker",
      name: "test",
      avatar_url: "test",
    };
    return request(app)
      .post("/api/users")
      .send(testUser)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("key already exists");
      });
  });
});

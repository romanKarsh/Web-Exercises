'use strict'
const log = console.log;
const index = require("./index");
const request = require("supertest");
const express = require("express");
const app = express();
const endOfLine = require('os').EOL;

app.use(express.urlencoded({ extended: false }));
app.use("/", index);

function printResult(testName, err) {
  err ? log("Failed Test: " + testName + endOfLine + err) : log("Passed Test: " + testName)
}

request(app)
.get("/api/ping")
.expect("Content-Type", /json/)
.expect({"success": true})
.expect(200)
.end(function(err, res) {
  printResult("/api/ping", err)
});

request(app)
.get("/api/posts")
.expect("Content-Type", /json/)
.expect({"error": "Tags parameter is required"})
.expect(400)
.end(function(err, res) {
  printResult("/api/posts no tag", err)
});

request(app)
.get("/api/posts?tags=tech&sortBy=is")
.expect("Content-Type", /json/)
.expect({"error": "sortBy parameter is invalid"})
.expect(400)
.end(function(err, res) {
  printResult("/api/posts wrong sortBy", err)
});
  
request(app)
.get("/api/posts?tags=tech&direction=up")
.expect("Content-Type", /json/)
.expect({"error": "direction parameter is invalid"})
.expect(400)
.end(function(err, res) {
  printResult("/api/posts wrong direction", err)
});

request(app)
.get("/api/posts?tags=tech&sortBy=id&direction=down")
.expect("Content-Type", /json/)
.expect({"error": "direction parameter is invalid"})
.expect(400)
.end(function(err, res) {
  printResult("/api/posts right sortBy wrong direction", err)
});

request(app)
.get("/api/posts?tags=tech&sortBy=ids&direction=desc")
.expect("Content-Type", /json/)
.expect({"error": "sortBy parameter is invalid"})
.expect(400)
.end(function(err, res) {
  printResult("/api/posts wrong sortBy right direction", err)
});

// good response tests

request(app)
.get("/api/posts?tags=tech")
.expect("Content-Type", /json/)
.expect(200)
.end(function(err, res) {
  printResult("/api/posts just tag, 200", err)
});

request(app)
.get("/api/posts?tags=tech,health")
.expect("Content-Type", /json/)
.expect(200)
.end(function(err, res) {
  printResult("/api/posts two tags, 200", err)
});

request(app)
.get("/api/posts?tags=tech&sortBy=id")
.expect("Content-Type", /json/)
.expect(200)
.end(function(err, res) {
  printResult("/api/posts tag and sortBy, 200", err)
});

request(app)
.get("/api/posts?tags=tech&direction=desc")
.expect("Content-Type", /json/)
.expect(200)
.end(function(err, res) {
  printResult("/api/posts tag and direction, 200", err)
});

request(app)
.get("/api/posts?tags=tech&sortBy=id&direction=desc")
.expect("Content-Type", /json/)
.expect(200)
.end(function(err, res) {
  printResult("/api/posts tag, sortBy and direction, 200", err)
});

// serious tests

request(app)
.get("/api/posts?tags=tech")
.expect(200)
.expect((res) => { if (!('posts' in res.body)) throw new Error("missing posts key");})
.end(function(err, res) {
  printResult("/api/posts response has posts", err)
});


request(app)
.get("/api/posts?tags=tech")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  res.body.posts.forEach(post => {
    if (!(post.tags.includes('tech'))) throw new Error("posts missing tag");
  });
})
.end(function(err, res) {
  printResult("/api/posts response posts have tag", err)
});


request(app)
.get("/api/posts?tags=tech,health")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  res.body.posts.forEach(post => {
    if (!(post.tags.includes('tech') || post.tags.includes('health'))) throw new Error("posts missing tag");
  });
})
.end(function(err, res) {
  printResult("/api/posts response posts has at least one tag", err)
});


request(app)
.get("/api/posts?tags=tech")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  for (let i = 0; i < res.body.posts.length-1; i++) {
    if (res.body.posts[i].id > res.body.posts[i+1].id) throw new Error("not sorted right");
  } 
})
.end(function(err, res) {
  printResult("/api/posts response posts default sotfBy and direction", err)
});


request(app)
.get("/api/posts?tags=tech&direction=desc")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  for (let i = 0; i < res.body.posts.length-1; i++) {
    if (res.body.posts[i].id < res.body.posts[i+1].id) throw new Error("not sorted right");
  } 
})
.end(function(err, res) {
  printResult("/api/posts response posts default sotfBy and direction desc", err)
});


request(app)
.get("/api/posts?tags=tech&sortBy=likes")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  for (let i = 0; i < res.body.posts.length-1; i++) {
    if (res.body.posts[i].likes > res.body.posts[i+1].likes) throw new Error("not sorted right");
  } 
})
.end(function(err, res) {
  printResult("/api/posts response posts sotfBy likes and default direction", err)
});


request(app)
.get("/api/posts?tags=tech&sortBy=popularity&direction=desc")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  for (let i = 0; i < res.body.posts.length-1; i++) {
    if (res.body.posts[i].popularity < res.body.posts[i+1].popularity) throw new Error("not sorted right");
  } 
})
.end(function(err, res) {
  printResult("/api/posts response posts sortBy=popularity&direction=desc", err)
});


request(app)
.get("/api/posts?tags=tech&sortBy=reads&direction=asc")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  for (let i = 0; i < res.body.posts.length-1; i++) {
    if (res.body.posts[i].reads > res.body.posts[i+1].reads) throw new Error("not sorted right");
  } 
})
.end(function(err, res) {
  printResult("/api/posts response posts sortBy=reads&direction=asc", err)
});


request(app)
.get("/api/posts?tags=tech,science,history,health,politics,culture")
.expect(200)
.expect((res) => {
  if (!('posts' in res.body)) throw new Error("missing posts key");
  const dictIds =  {};
  res.body.posts.forEach(post => {
    if (!(post.id in dictIds)) {
      dictIds[post.id] = true;
    } else {
      throw new Error("repeated posts");
    }
  });
})
.end(function(err, res) {
  printResult("/api/posts response posts many tags, no repeated posts", err)
});
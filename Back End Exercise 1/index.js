'use strict'
const log = console.log;
const assert = require('assert');
const request = require('request');
const express = require("express");
const index = express.Router();
const TinyQueue = require('tinyqueue');
const VALID_SORTBY = ["id", "reads", "likes", "popularity"];
const VALID_DIRECTION = ["asc", "desc"];
const SORTBY_DEFAULT = VALID_SORTBY[0];
const DIRECTION_DEFAULT = VALID_DIRECTION[0];
// BONUS: Cache the results of the API calls on the server, using exact LRU for eviction policy
const CACHE_MAXSIZE = 10;
const CACHE = {"tagList": []};
let cacheSize = 0;


index.get("/api/ping", (req, res) => {
    res.status(200).json({"success": true});
});

index.get("/api/posts", (req, res) => {
    const sortBy = req.query.sortBy ? req.query.sortBy : SORTBY_DEFAULT;
    const direction = req.query.direction ? req.query.direction : DIRECTION_DEFAULT;
    if (!req.query.tags) {
        res.status(400).json({"error": "Tags parameter is required"});
    } else if (!VALID_SORTBY.includes(sortBy)) {
        res.status(400).json({"error": "sortBy parameter is invalid"});
    } else if (!VALID_DIRECTION.includes(direction)) { 
        res.status(400).json({"error": "direction parameter is invalid"});
    } else {
        assert(req.query.tags && VALID_SORTBY.includes(sortBy) && VALID_DIRECTION.includes(direction));
        const tagStr = req.query.tags;
        const tags = tagStr.split(",");
        const postPromises = tags.map((tag) => blogPosts(tag)); // collect requests to the API
        Promise.allSettled(postPromises).then((results) => {
            const retPosts = {"posts": []};
            // https://github.com/mourner/tinyqueue. Priority queue in JavaScript. Second argument is custom item comparator
            const queue = new TinyQueue([], (a, b) => (direction === DIRECTION_DEFAULT ? a[sortBy] -  b[sortBy] : b[sortBy] - a[sortBy]));
            const dictIds =  {}; // dictionary to keep track of post ids already seen (to remove all repeated posts)
            let i = 0;
            results.forEach((result) => {
                if (result.status === "fulfilled") {
                    const newTag = addTagToCache(tags[i]) // add tags[i], the current tag name to the cache
                    result.value.posts.forEach((post) => {
                        if (!(post.id in dictIds)) { // add post only if it is new
                            dictIds[post.id] = true;
                            queue.push(post);
                        }
                        newTag ? addPostToCache(tags[i], post) : null;
                    });
                }
                i++;
            });
            while (queue.length) retPosts.posts.push(queue.pop());
            res.status(200).json(retPosts);
        }, (err) => {
            res.status(400).json({"error": err});
        });
    }
});


// API helper
function blogPosts(tag) {
    if (tag in CACHE) { // tag is in the cache
        // log("cache hit on tag name " + tag);
        return Promise.resolve({"posts": CACHE[tag]});
    }
    // log("cache miss on tag name " + tag);
	return new Promise((resolve, reject) => {
        const url = 'https://hatchways.io/api/assessment/blog/posts?tag=' + tag;
		request({url, json: true}, (error, response, body) => {
			if (error) {
				reject("Can't connect to server");
			} else if (response.statusCode !== 200) {
				reject('Issue with getting resource');
			} else {
                resolve(body);
			}
		})
	})
}


// Cache helpers
// Adds curTagName to CACHE.tagList and returns if curTagName was in the cache already
function addTagToCache(curTagName) {
    let newTag = true;
    if (curTagName in CACHE) { // tagName already in the cache
        newTag = false;
        let j = 0; 
        while (CACHE.tagList[j] !== curTagName) j++;
        CACHE.tagList.splice(j, 1); // delete curTagName from where it was in the taglist
    } else if (cacheSize === CACHE_MAXSIZE) { // tagName not in the cache and cache full
        CACHE[curTagName] = [];
        const tagRemove = CACHE.tagList.shift(); // evict LRU tag
        delete CACHE[tagRemove];
    } else { // tagName not in the cache but it isn't full
        CACHE[curTagName] = [];
        cacheSize++;
    }
    CACHE.tagList.push(curTagName); // make curTagName most recently used
    return newTag;
}

// add post to the posts of curTagName in the cache
function addPostToCache(curTagName, post) {
    CACHE[curTagName].push(post);
}

module.exports = index;
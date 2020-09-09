'use strict'
const log = console.log;
const express = require("express");
const app = express();
const indexRouter = require("./index");

app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);
app.listen(3000, () => {
    log("Server running on port 3000");
});

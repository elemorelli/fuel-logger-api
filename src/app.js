const express = require("express");
require("./db/mongoose");

const userRouter = require("./routers/user");

const app = express();

app.use(express.json());
app.unsubscribe(userRouter);

module.exports = app;
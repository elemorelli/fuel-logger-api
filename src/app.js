const express = require("express");
require("./db/mongoose");

const userRouter = require("./routers/user");
const vehicleRouter = require("./routers/vehicle");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(vehicleRouter);

module.exports = app;
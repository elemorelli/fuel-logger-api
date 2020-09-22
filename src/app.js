const express = require("express");

const userRouter = require("./routers/user");
const vehicleRouter = require("./routers/vehicle");
const fillUpRouter = require("./routers/fill-up");
const statsRouter = require("./routers/stats");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(vehicleRouter);
app.use(fillUpRouter);
app.use(statsRouter);

module.exports = app;
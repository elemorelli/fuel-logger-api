const express = require("express");
require("./db/mongoose");

const userRouter = require("./routers/user");
const vehicleRouter = require("./routers/vehicle");
const fillUpRouter = require("./routers/fill-up");
const statsRouter = require("./routers/stats");
const telegramRouter = require("./routers/telegram");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(vehicleRouter);
app.use(fillUpRouter);
app.use(statsRouter);
app.use(telegramRouter);

module.exports = app;
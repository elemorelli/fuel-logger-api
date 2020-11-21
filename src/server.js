const express = require("express");
const pino = require("pino-http")({ autoLogging: false });
const logger = require("pino")();
const { PORT } = require("./environment");

require("./db/mongoose");

const userRouter = require("./routers/user");
const vehicleRouter = require("./routers/vehicle");
const fillUpRouter = require("./routers/fill-up");
const statsRouter = require("./routers/stats");

const corsMiddleware = require("./middleware/cors");

const app = express();

app.use(pino);
app.use(corsMiddleware);

app.use(express.json());
app.use(userRouter);
app.use(vehicleRouter);
app.use(fillUpRouter);
app.use(statsRouter);

app.listen(PORT, () => {
  logger.info(`Server is up on port ${PORT}`);
});

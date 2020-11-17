const { MONGODB_URL } = require("../environment");
const logger = require("pino")();
const mongoose = require("mongoose");

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Successfully connected to the DB");
  })
  .catch((error) => {
    logger.error(`Error connecting to the DB: ${error.message}`);
  });

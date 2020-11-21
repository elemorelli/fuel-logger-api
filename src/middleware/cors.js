const { DEVELOPMENT_MODE } = require("../environment");
const logger = require("pino")();

const corsMiddleware = (req, res, next) => {
  logger.info("Inside Cors Middleware!");
  logger.info({ DEVELOPMENT_MODE });

  if (DEVELOPMENT_MODE === "true") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  }
  next();
};

module.exports = corsMiddleware;

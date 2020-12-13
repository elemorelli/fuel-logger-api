const { DEVELOPMENT_MODE, CORS_ALLOWED_DOMAIN } = require("../environment");

const corsMiddleware = (req, res, next) => {
  if (CORS_ALLOWED_DOMAIN) {
    res.header("Access-Control-Allow-Origin", CORS_ALLOWED_DOMAIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  } else if (DEVELOPMENT_MODE === "true") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  }
  next();
};

module.exports = corsMiddleware;

const requiredEnvVariables = ["PORT", "MONGODB_URL", "JWT_SECRET"];
const logger = require("pino")();

requiredEnvVariables.forEach((envVariable) => {
  if (!process.env[envVariable]) {
    logger.error(`WARNING: Environment variable '${envVariable}' is required`);
  }
});

module.exports = {
  PORT: process.env.PORT,
  MONGODB_URL: process.env.MONGODB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  DEVELOPMENT_MODE: process.env.DEVELOPMENT_MODE,
};

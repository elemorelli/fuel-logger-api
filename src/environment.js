const requiredEnvVariables = ['PORT', 'MONGODB_URL', 'JWT_SECRET', 'SERVER_URL', 'TELEGRAM_BOT_TOKEN'];

requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
        console.error(`WARNING: Environment variable '${envVariable}' is required`);
    }
});

module.exports = {
    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SERVER_KEY: process.env.SERVER_KEY,
    SERVER_CERT: process.env.SERVER_CERT,
    SERVER_URL: process.env.SERVER_URL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN
};
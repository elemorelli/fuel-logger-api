const { SERVER_URL, TELEGRAM_BOT_TOKEN } = require('../environment');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

const logger = require('pino')();

const app = require('../app');

bot.setWebHook(`${SERVER_URL}/bot${TELEGRAM_BOT_TOKEN}`).then(() => {
    logger.info('Telegram bot started');
}).catch((error) => {
    logger.error(`Error trying to start up Telegram bot: ${error.message}`);
});

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

module.exports = bot;
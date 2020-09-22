const { SERVER_URL, TELEGRAM_BOT_TOKEN } = require ("./environment");

const TelegramBot = require("node-telegram-bot-api");
const app = require("./app");

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${SERVER_URL}/bot${TELEGRAM_BOT_TOKEN}`);

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.on("message", msg => {
    bot.sendMessage(msg.chat.id, "Message received!");
});

module.exports = bot;
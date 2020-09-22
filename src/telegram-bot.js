const { SERVER_URL, TELEGRAM_BOT_TOKEN } = require ("./environment");

const TelegramBot = require("node-telegram-bot-api");
const app = require("./app");

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
bot.setWebHook(`${SERVER_URL}/bot${TELEGRAM_BOT_TOKEN}`);

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.onText(/\/help/, msg => {
    
    const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: JSON.stringify({
          keyboard: [
            ["Log in"],
            ["Sign up"]
          ]
        })
      };
      bot.sendMessage(msg.chat.id, "What to do?", opts);
});

module.exports = bot;
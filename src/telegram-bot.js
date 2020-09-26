const { SERVER_URL, TELEGRAM_BOT_TOKEN } = require('./environment');

const TelegramBot = require('node-telegram-bot-api');
const logger = require('pino')();

const app = require('./app');

const User = require('./models/user');
const Vehicle = require('./models/vehicle');

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);

bot.setWebHook(`${SERVER_URL}/bot${TELEGRAM_BOT_TOKEN}`).then(() => {
  logger.info('Telegram bot started');
}).catch((error) => {
  logger.error(`Error trying to start up Telegram bot: ${error.message}`);
});

app.post(`/bot${TELEGRAM_BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

const parseArguments = (text) => {
  return text.replace(/\s+/, ' ').split(' ').splice(1);
};

bot.onText(/\/help/, (message) => {

  const response = `Available commands
  /link <user> <password>
  /unlink
  /fill
  /stats`;


  bot.sendMessage(message.from.id, response);
});

bot.onText(/\/link/, async (message) => {

  const chatId = message.from.id;
  const args = parseArguments(message.text);

  try {
    const user = await User.findByCredentials(args[0], args[1]);

    if (!user.telegramId) {
      user.telegramId = chatId;
      await user.save();
      bot.deleteMessage(chatId, message.message_id);
      bot.sendMessage(chatId, 'User successfully linked');
    } else {
      bot.sendMessage(chatId, `The user ${args[0]} is already linked`);
    }

  } catch (error) {
    bot.sendMessage(chatId, 'Invalid credentials');
  }
});

bot.onText(/\/unlink/, async (message) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId });

  if (user) {
    user.telegramId = undefined;
    await user.save();
    bot.sendMessage(chatId, 'User successfully unlinked');
  } else {
    bot.sendMessage(chatId, `No linked user found`);
  }

});

bot.onText(/\/vehicles/, async (message) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId });

  if (user) {

    await user.populate('vehicles').execPopulate();

    let response = 'These are your vehicles:\n';
    for (const vehicle of user.vehicles) {
      response += `/vehicle_${vehicle._id} ${vehicle.model}\n`;
    }

    bot.sendMessage(chatId, response);
  } else {
    bot.sendMessage(chatId, `No linked user found`);
  }

});

bot.onText(/\/vehicle_(.+)/, async (message, match) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId });
  const vehicleId = match[1];

  if (user) {

    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: user._id });
    const picture = vehicle.picture;

    bot.sendPhoto(chatId, picture, { caption: vehicle.model });
  } else {
    bot.sendMessage(chatId, `No linked user found`);
  }

});

module.exports = bot;
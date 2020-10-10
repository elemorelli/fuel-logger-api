const User = require('../../models/user');
const bot = require('../bot');

const parseArguments = (text) => {
  return text.replace(/\s+/, ' ').split(' ').splice(1);
};

bot.onText(/\/login/, async (message) => {

  const chatId = message.from.id;
  const args = parseArguments(message.text);

  bot.deleteMessage(chatId, message.message_id);

  const user = await User.findOne({ telegramId: chatId });

  if (user) {
    return bot.sendMessage(chatId, 'You are already logged in');
  }

  try {

    const user = await User.findByCredentials(args[0], args[1]);

    user.telegramId = chatId;
    await user.save();
    bot.sendMessage(chatId, 'User successfully logged in');

  } catch (error) {
    bot.sendMessage(chatId, 'Invalid credentials. Usage: /login <user> <password>');
  }
});
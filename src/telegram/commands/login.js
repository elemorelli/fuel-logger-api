const User = require('../../models/user');
const bot = require('../bot');

const parseArguments = (text) => {
  return text.replace(/\s+/, ' ').split(' ').splice(1);
};

bot.onText(/\/login/, async (message) => {

  const chatId = message.from.id;
  const args = parseArguments(message.text);

  bot.deleteMessage(chatId, message.message_id);
  try {
    const user = await User.findByCredentials(args[0], args[1]);

    if (!user.telegramId) {
      user.telegramId = chatId;
      await user.save();
      bot.sendMessage(chatId, 'User successfully logged in');
      
    } else {
      bot.sendMessage(chatId, 'You are already logged in');
    }

  } catch (error) {
    bot.sendMessage(chatId, 'Invalid credentials. Usage: /login <user> <password>');
  }
});
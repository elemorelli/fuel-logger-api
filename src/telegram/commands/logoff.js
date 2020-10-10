const User = require('../../models/user');
const bot = require('../bot');

bot.onText(/\/logout/, async (message) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId });

  if (!user) {
    return bot.sendMessage(chatId, `No logged user found`);
  }

  user.telegramId = undefined;
  await user.save();
  bot.sendMessage(chatId, 'User successfully logged out');

});
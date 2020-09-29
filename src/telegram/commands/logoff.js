const User = require('../../models/user');
const bot = require('../bot');

bot.onText(/\/logoff/, async (message) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId });

  if (user) {
    user.telegramId = undefined;
    await user.save();
    bot.sendMessage(chatId, 'User successfully logged off');
  } else {
    bot.sendMessage(chatId, `No logged user found`);
  }

});
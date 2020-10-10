const User = require('../../models/user');
const bot = require('../bot');

bot.onText(/\/vehicles/, async (message) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId }).populate('vehicles');

  if (!user) {
    return bot.sendMessage(chatId, `No linked user found`);
  }

  let response = 'These are your vehicles:\n';
  for (const vehicle of user.vehicles) {
    response += `/vehicle_${vehicle._id} ${vehicle.model}\n`;
  }

  bot.sendMessage(chatId, response);

});
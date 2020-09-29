const bot = require('../bot');

const User = require('../../models/user');
const Vehicle = require('../../models/vehicle');

const { calculateVehicleStats } = require('../../services/stats');

bot.onText(/\/vehicle_(.+)/, async (message, match) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId });
  const vehicleId = match[1];

  if (user) {

    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: user._id });
    const picture = vehicle.picture;

    await vehicle.populate({
      path: 'fillUps',
      options: {
        sort: { 'odometer': 1 }
      }
    }).execPopulate();

    const stats = calculateVehicleStats(vehicle, true);

    bot.sendPhoto(chatId, picture, { caption: `${vehicle.model} - Next fill up: ${stats.nextFillUp}` });
  } else {
    bot.sendMessage(chatId, `No linked user found`);
  }

});

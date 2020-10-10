const bot = require('../bot');

const User = require('../../models/user');
const Vehicle = require('../../models/vehicle');

const { calculateVehicleStats } = require('../../services/stats');

bot.onText(/\/vehicle_(.+)/, async (message, match) => {

  const chatId = message.from.id;
  const user = await User.findOne({ telegramId: chatId });
  const vehicleId = match[1];

  if (!user) {
    return bot.sendMessage(chatId, `No linked user found`);
  }

  const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: user._id }).populate({
    path: 'fillUps',
    options: {
      sort: { 'odometer': 1 }
    }
  });

  const picture = vehicle.picture;

  const stats = calculateVehicleStats(vehicle, true);

  bot.sendPhoto(chatId, picture, { caption: `${vehicle.model} - Next fill up: ${stats.nextFillUp}` });

  user.selectedVehicle = vehicleId;
  user.save();

});

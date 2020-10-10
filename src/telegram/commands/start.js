const User = require('../../models/user');
const bot = require('../bot');

bot.onText(/\/help|\/start/, async (message) => {

    const chatId = message.from.id;
    const user = await User.findOne({ telegramId: chatId });

    if (!user) {
        return bot.sendMessage(chatId, 'Available commands:' + '\n' +
            '/login <user> <password>' + '\n' +
            '/create <user> <password>');
    }

    bot.sendMessage(chatId, 'Available commands:' + '\n' +
        '/create_vehicle - Creates a new vehicle' + '\n' +
        '/vehicles - Lists your vehicles and lets you selects one' + '\n' +
        '/fill - Fill up the selected vehicle' + '\n' +
        '/stats - Show statistics about your selected vehicle' + '\n' +
        '/logout');

});

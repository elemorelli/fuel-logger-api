const bot = require('../bot');

const User = require('../../models/user');

const states = {};

bot.onText(/\/fillup/, async (message) => {

    const chatId = message.from.id;
    const user = await User.findOne({ telegramId: chatId }).populate('selectedVehicle');

    if (!user) {
        return bot.sendMessage(chatId, `No linked user found`);
    }

    const vehicle = user.selectedVehicle;

    if (!vehicle) {
        return bot.sendMessage(chatId, `No vehicle selected. Pick one with /vehicles`);
    }

    

    let currentState = states[chatId];

    if (!currentState) {
        currentState = states[chatId] = {};
        currentState.state = 'ODOMETER';
        return bot.sendMessage(chatId, `What is the current odometer value?`);
    } else if (currentState.state === 'ODOMETER') {
        currentState.state = 'FUEL';
        return bot.sendMessage(chatId, `How much fuel did you filled up?`);
    } else if (currentState.state === 'FUEL') {
        currentState.state = 'PRICE';
        return bot.sendMessage(chatId, `How much did it cost?`);
    }





    bot.sendMessage(chatId, 'hola');

});

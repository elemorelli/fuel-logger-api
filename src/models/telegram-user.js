const mongoose = require("mongoose");
const Vehicle = require("./vehicle");

const schema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

schema.virtual("vehicles", {
    ref: "Vehicle",
    localField: "_id",
    foreignField: "telegramOwner"
});

schema.statics.findByTelegramId = async (telegramId) => {
    return await TelegramUser.findOne({ telegramId });
};

schema.pre("remove", async function (next) {
    const user = this;
    // TODO: Delete everything? Or just unbind the vehicles from this document? See user.js
    await Vehicle.deleteMany({
        telegramOwner: user._id
    });
    next();
});

const TelegramUser = mongoose.model("TelegramUser", schema);

module.exports = TelegramUser;
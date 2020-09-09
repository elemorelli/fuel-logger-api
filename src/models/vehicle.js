const mongoose = require("mongoose");
const FillUp = require("./fill-up");

const schema = new mongoose.Schema({
    model: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    fuelCapacity: {
        type: Number,
        min: 0
    },
    picture: {
        type: Buffer
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    telegramOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TelegramOwner"
    }
}, {
    timestamps: true
});

schema.virtual("fillUps", {
    ref: "FillUp",
    localField: "_id",
    foreignField: "owner"
});

schema.methods.toJSON = function () {
    const vehicle = this;
    const vehicleProfile = vehicle.toObject();
    delete vehicleProfile.picture;
    return vehicleProfile;
};

schema.pre("remove", async function (next) {
    const vehicle = this;
    await FillUp.deleteMany({
        owner: vehicle._id
    });
    next();
});

const Vehicle = mongoose.model("Vehicle", schema);

module.exports = Vehicle;
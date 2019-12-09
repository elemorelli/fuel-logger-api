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
    picture: {
        type: Buffer
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
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
    const user = this;
    await FillUp.deleteMany({
        owner: user._id
    });
    next();
});

const Vehicle = mongoose.model("Vehicle", schema);

module.exports = Vehicle;
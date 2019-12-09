const mongoose = require("mongoose");

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

schema.methods.toJSON = function () {
    const vehicle = this;
    const vehicleProfile = vehicle.toObject();
    delete vehicleProfile.picture;
    return vehicleProfile;
};

const Vehicle = mongoose.model("Vehicle", schema);

module.exports = Vehicle;
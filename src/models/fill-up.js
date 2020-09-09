const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    odometer: {
        type: Number,
        min: 0
    },
    fuel: {
        type: Number,
        min: 0
    },
    price: {
        type: Number,
        min: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Vehicle"
    }
}, {
    timestamps: true
});

const FillUp = mongoose.model("FillUp", schema);

module.exports = FillUp;
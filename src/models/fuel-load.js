const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    odometer: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Invalid number");
            }
        }
    },
    fuel: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Invalid number");
            }
        }
    },
    price: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error("Invalid number");
            }
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Vehicle"
    }
}, {
    timestamps: true
});

const FuelLoad = mongoose.model("FuelLoad", schema);

module.exports = FuelLoad;
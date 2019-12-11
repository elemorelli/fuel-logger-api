const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
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

const FillUp = mongoose.model("FillUp", schema);

module.exports = FillUp;
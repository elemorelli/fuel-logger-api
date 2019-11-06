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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true
});

const Vehicle = mongoose.model("Vehicle", schema);

module.exports = Vehicle;
const mongoose = require("mongoose");
const validator = require("validator");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            // TODO: Password strength check
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password is too weak");
            }
        }
    },
    emaill: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

const User = mongoose.model("User", schema);

module.exports = User;
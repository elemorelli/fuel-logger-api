const { JWT_SECRET } = require('../environment');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passwordValidator = require('../utils/password-validator');
const Vehicle = require('./vehicle');

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
        validate: {
            validator: (value) => {
                const result = passwordValidator.test(value);
                if (!result.strong) {
                    throw new Error(result.errors.join(', '));
                }
                return true;
            }
        }

    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail
        }
    },
    telegramId: {
        type: Number,
    },
    selectedVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    avatar: {
        type: Buffer
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

schema.virtual('vehicles', {
    ref: 'Vehicle',
    localField: '_id',
    foreignField: 'owner'
});

schema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Invalid credentials');
    }
    return user;
};

schema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        JWT_SECRET,
        { expiresIn: '300d' }); // TODO: Reduce expiration and allow to refresh the token
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

schema.methods.toJSON = function () {
    const user = this;
    const publicProfile = user.toObject();
    delete publicProfile.password;
    delete publicProfile.avatar;
    delete publicProfile.tokens;
    return publicProfile;
};

schema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

schema.pre('remove', async function (next) {
    const user = this;
    await Vehicle.deleteMany({
        owner: user._id
    });
    next();
});

const User = mongoose.model('User', schema);

module.exports = User;
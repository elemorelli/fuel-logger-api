const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

// TODO: References to things owned by the user
// schema.virtual("referenceAttribute", {
//     ref: "OtherModel",
//     localField: "_id",
//     foreignField: "owner"
// });

schema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid credentials");
    }
    return user;
};

schema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_TOKEN,
        { expiresIn: "14 days" }
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

schema.methods.toJSON = function () {
    const user = this;
    const publicProfile = user.toObject();
    delete publicProfile.password;
    // delete publicProfile.avatar;
    delete publicProfile.tokens;
    return publicProfile;
};

schema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

schema.pre("remove", async function (next) {
    //const user = this;
    // TODO: Remove all documents owned by this user
    //await otherModel.deleteMany({
    //    owner: user._id
    //});
    next();
});

const User = mongoose.model("User", schema);

module.exports = User;
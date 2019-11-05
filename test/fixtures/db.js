const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/user");

const createUser = (name, email, password) => {
    const _id = new mongoose.Types.ObjectId();
    return {
        _id, name, email, password, tokens: [{
            token: jwt.sign({ _id }, process.env.JWT_SECRET)
        }]
    };
};

const userOne = createUser("user one", "first@user.com", "JustPass332211!!");
const userTwo = createUser("user two", "second@user.com", "otherPass123123!!");

const populateDatabase = async () => {
    await User.deleteMany();

    await new User(userOne).save();
    await new User(userTwo).save();
};

module.exports = {
    userOne,
    userOneId: userOne._id,
    userTwo,
    userTwoId: userTwo._id,
    token: userOne.tokens[0].token,
    populateDatabase
};
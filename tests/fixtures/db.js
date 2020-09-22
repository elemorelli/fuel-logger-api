const { JWT_SECRET } = require('../environment');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('../../src/models/user');

const createUser = (name, email, password, avatarPath) => {
    const _id = new mongoose.Types.ObjectId();
    const avatar = avatarPath ? fs.readFileSync(__dirname + '/' + avatarPath) : undefined;
    return {
        _id, name, email, password, avatar, tokens: [{
            token: jwt.sign({ _id }, JWT_SECRET)
        }]
    };
};

const userOne = createUser('user one', 'first@user.com', 'JustPass332211!!', 'avatar.jpeg');
const userTwo = createUser('user two', 'second@user.com', 'otherPass123123!!');

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
    userOneToken: userOne.tokens[0].token,
    userTwoToken: userTwo.tokens[0].token,
    populateDatabase
};
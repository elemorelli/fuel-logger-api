const express = require("express");
const TelegramUser = require("../models/telegram-user");
const telegramAuth = require("../middleware/telegram-auth");

const router = new express.Router();

router.post("/telegram/users", telegramAuth, async (req, res) => {
    try {
        const user = new TelegramUser(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/telegram/users/:id", telegramAuth, async (req, res) => {
    try {
        const user = await TelegramUser.findOne({
            telegramId: req.params.id
        });
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
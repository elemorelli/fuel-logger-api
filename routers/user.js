const express = require("express");
const User = require("../models/user");

const router = new express.Router();

router.post("/users", async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        res.status(200).send("login");
    } catch (error) {
        res.status(400).send("Invalid credentials");
    }
});

router.post("/users/logout", async (req, res) => {
    try {
        res.status(200).send("logout");
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/users/logout/all", async (req, res) => {
    try {
        res.status(200).send("logout all");
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/users/me", async (req, res) => {
    res.status(200).send("profile");
});

router.delete("/users/me", async (req, res) => {
    try {
        res.status(200).send("delete profile");
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
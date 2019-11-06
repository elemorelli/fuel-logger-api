const express = require("express");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/vehicles", auth, async (req, res) => {
    const vehicle = new Vehicle({
        ...req.body,
        owner: req.user._id
    });

    try {
        await vehicle.save();
        res.status(201).send(vehicle);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
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

router.get("/vehicles", auth, async (req, res) => {
    const matcher = {};
    const sort = {};

    if (req.query.sortBy) {
        sort[req.query.sortBy] = req.query.order === "desc" ? -1 : 1;
    }

    try {
        const vehicles = await Vehicle.find({
            ...matcher,
            owner: req.user._id
        }, null, {
            skip: parseInt(req.query.skip),
            limit: parseInt(req.query.lmit),
            sort
        });
        res.send(vehicles);
    } catch (error) {
        res.status(500);
    }
});

router.get("/vehicles/:id", auth, async (req, res) => {

    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params._id,
            owner: req.user._id
        });

        if (!vehicle) {
            res.status(404).send();
        }
        res.send(vehicle);
    } catch (error) {
        res.status(500);
    }
});

router.patch("/vehicles/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedFields = ["model"];
    const isValidOperation = updates.every((update) => allowedFields.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid fields" });
    }

    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!vehicle) {
            return res.status(404).send();
        }
        allowedFields.forEach((field) => vehicle[field] = req.body[field]);
        await vehicle.save();
        res.send(vehicle);
    } catch (error) {
        res.status(500).send();
    }
});

router.delete("/vehicles/:id", auth, async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!vehicle) {
            return res.status(404).send();
        }
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;
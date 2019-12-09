const express = require("express");
const sharp = require("sharp");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

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

async function getVehicleById(req, res) {
    const vehicle = await Vehicle.findOne({
        _id: req.params.vehicle_id,
        owner: req.user._id
    });
    if (!vehicle) {
        res.status(404).send();
    }
    return vehicle;
}

router.get("/vehicles/:vehicle_id", auth, async (req, res) => {

    try {
        const vehicle = await getVehicleById(req, res);
        res.send(vehicle);
    } catch (error) {
        res.status(500).send();
    }
});

router.patch("/vehicles/:vehicle_id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedFields = ["model"];
    const isValidOperation = updates.every((update) => allowedFields.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid fields" });
    }

    try {
        const vehicle = await getVehicleById(req, res);
        allowedFields.forEach((field) => vehicle[field] = req.body[field]);
        await vehicle.save();
        res.send(vehicle);
    } catch (error) {
        res.status(500).send();
    }
});

router.delete("/vehicles/:vehicle_id", auth, async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({
            _id: req.params.vehicle_id,
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

router.post("/vehicles/:vehicle_id/picture", auth, upload.single("picture"), async (req, res) => {
    try {
        const vehicle = await getVehicleById(req, res);

        const buffer = await sharp(req.file.buffer).resize({
            width: 250,
            height: 250
        }).png().toBuffer();

        vehicle.picture = buffer;
        await vehicle.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/vehicles/:vehicle_id/picture", auth, async (req, res) => {
    try {
        const vehicle = await getVehicleById(req, res);

        if (!vehicle.picture) {
            res.status(404).send();
        } else {
            res.set("Content-Type", "image/png");
            res.send(vehicle.picture);
        }
    } catch (error) {
        res.status(400).send();
    }
});

router.delete("/vehicles/:vehicle_id/picture", auth, async (req, res) => {

    const vehicle = await getVehicleById(req, res);
    vehicle.picture = undefined;
    await vehicle.save();
    res.send();
});

module.exports = router;
const express = require("express");
const sharp = require("sharp");
const ss = require("simple-statistics");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = new express.Router();

async function getVehicleById(req, res, populateFillUps) {
    const filter = {
        _id: req.params.vehicle_id,
        owner: req.user._id
    };
    const vehicle = populateFillUps ?
        await Vehicle.findOne(filter).populate({ path: "fillUps", options: { sort: { "odometer": 1 } } }) :
        await Vehicle.findOne(filter);
    if (!vehicle) {
        res.status(404).send();
    }
    return vehicle;
}

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
    const allowedFields = ["model, fuelCapacity"];
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
        const vehicle = await getVehicleById(req, res);
        vehicle.remove();
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

router.get("/vehicles/:vehicle_id/stats", auth, async (req, res) => {
    try {
        const vehicle = await getVehicleById(req, res, true);

        const distancesBetweenFillUps = [];
        const odometerValues = [];

        for (let i = 0; i < vehicle.fillUps.length; i++) {
            const fillUp = vehicle.fillUps[i];
            const nextFillUp = vehicle.fillUps[i + 1];

            odometerValues.push(fillUp.odometer);

            if (nextFillUp) {
                distancesBetweenFillUps.push(nextFillUp.odometer - fillUp.odometer);
            }
        }

        const averageDistanceBetweenFillUps = distancesBetweenFillUps.length ?
            ss.mean(distancesBetweenFillUps) : undefined;
        const maxDistanceBetweenFillUps = distancesBetweenFillUps.length ?
            ss.max(distancesBetweenFillUps) : undefined;
        const nextFillUp = averageDistanceBetweenFillUps ?
            ss.max(odometerValues) + averageDistanceBetweenFillUps : undefined;
        const maxDistanceToFillUp = maxDistanceBetweenFillUps ?
            ss.max(odometerValues) + maxDistanceBetweenFillUps : undefined;

        const stats = {
            averageDistanceBetweenFillUps: averageDistanceBetweenFillUps.toFixed(2),
            maxDistanceBetweenFillUps: maxDistanceBetweenFillUps.toFixed(2),
            nextFillUp: nextFillUp.toFixed(2),
            maxDistanceToFillUp: maxDistanceToFillUp.toFixed(2)
            // , fillUps: vehicle.fillUps
        };

        res.send(stats);
    } catch (error) {
        res.status(400).send();
    }
});

module.exports = router;
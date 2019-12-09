const express = require("express");
const FillUp = require("../models/fill-up");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");

const router = new express.Router();

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

router.post("/vehicles/:vehicle_id/fillups", auth, async (req, res) => {
    try {
        const vehicle = await getVehicleById(req, res);

        const fillUp = new FillUp({
            ...req.body,
            owner: vehicle._id
        });

        await fillUp.save();
        res.send();
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/vehicles/:vehicle_id/fillups", auth, async (req, res) => {
    try {
        const vehicle = await getVehicleById(req, res);
        res.send(vehicle.fillUps);
    } catch (error) {
        res.status(400).send();
    }
});


router.get("/vehicles/:vehicle_id/fillups/:fillup_id", auth, async (req, res) => {
    try {
        // TODO: Replace with easier way to validate user -> vehicule
        await getVehicleById(req, res);

        const fillUp = await FillUp.findOne({
            _id: req.params.fillup_id,
            owner: req.params.vehicle_id
        });
        res.send(fillUp);
    } catch (error) {
        res.status(500);
    }
});

router.delete("/vehicles/:vehicle_id/fillups/:fillup_id", auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedFields = ["odometer", "fuel", "price"];
        const isValidOperation = updates.every((update) => allowedFields.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ error: "Invalid fields" });
        }

        // TODO: Replace with easier way to validate user -> vehicule
        await getVehicleById(req, res);

        const fillUp = await FillUp.findOne({
            _id: req.params.fillup_id,
            owner: req.params.vehicle_id
        });
        if (!fillUp) {
            res.status(404).send();
        }

        allowedFields.forEach((field) => fillUp[field] = req.body[field]);
        await fillUp.save();
        res.send(fillUp);
    } catch (error) {
        res.status(500).send();
    }
});

router.delete("/vehicles/:vehicle_id/fillups/:fillup_id", auth, async (req, res) => {

    try {
        // TODO: Replace with easier way to validate user -> vehicule
        await getVehicleById(req, res);

        const fillUp = await FillUp.findOneAndDelete({
            _id: req.params.fillup_id,
            owner: req.params.vehicle_id
        });
        if (!fillUp) {
            return res.status(404).send();
        }
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
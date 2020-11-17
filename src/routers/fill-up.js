const express = require("express");
const FillUp = require("../models/fill-up");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/vehicles/:vehicle_id/fill-ups", auth, async (req, res) => {
  try {
    // TODO: Validate last date and last odometer value
    const vehicle = await Vehicle.findOne({
      _id: req.params.vehicle_id,
      owner: req.user._id,
    });
    if (!vehicle) {
      res.status(404).send();
    }

    const fillUp = new FillUp({
      ...req.body,
      owner: vehicle._id,
    });

    await fillUp.save();
    res.status(201).send(fillUp);
  } catch (error) {
    res.status(400).send(error);
  }
});

// TODO: Only for development? Maybe an import module?
router.put("/vehicles/:vehicle_id/fill-ups", auth, async (req, res) => {
  try {
    // TODO: Validate last date and last odometer value
    const vehicle = await Vehicle.findOne({
      _id: req.params.vehicle_id,
      owner: req.user._id,
    });
    if (!vehicle) {
      res.status(404).send();
    }

    for (const item of req.body) {
      const fillUp = new FillUp({
        ...item,
        owner: vehicle._id,
      });

      await fillUp.save();
    }

    res.status(201).send(vehicle.fillUps);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/vehicles/:vehicle_id/fill-ups", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.vehicle_id,
      owner: req.user._id,
    }).populate("fillUps");
    if (!vehicle) {
      res.status(404).send();
    }

    res.send(vehicle.fillUps);
  } catch (error) {
    res.status(400).send();
  }
});

router.get("/vehicles/:vehicle_id/fill-ups/:fillup_id", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.vehicle_id,
      owner: req.user._id,
    }).populate({
      path: "fillUps",
      match: { _id: { $eq: req.params.fillup_id } },
    });
    if (!vehicle || !vehicle.fillUps || !vehicle.fillUps.length) {
      res.status(404).send();
    }

    res.send(vehicle.fillUps[0]);
  } catch (error) {
    res.status(400).send();
  }
});

router.patch("/vehicles/:vehicle_id/fill-ups/:fillup_id", auth, async (req, res) => {
  try {
    // TODO: Validate last date and last odometer value
    const updates = Object.keys(req.body);
    const allowedFields = ["odometer", "fuel", "price", "date"];
    const isValidOperation = updates.every((update) => allowedFields.includes(update));

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid fields" });
    }

    const vehicle = await Vehicle.findOne({
      _id: req.params.vehicle_id,
      owner: req.user._id,
    }).populate({
      path: "fillUps",
      match: { _id: { $eq: req.params.fillup_id } },
    });
    if (!vehicle || !vehicle.fillUps || !vehicle.fillUps.length) {
      res.status(404).send();
    }

    const fillUp = vehicle.fillUps[0];

    allowedFields.forEach((field) => (fillUp[field] = req.body[field]));
    await fillUp.save();
    res.send(fillUp);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete("/vehicles/:vehicle_id/fill-ups/:fillup_id", auth, async (req, res) => {
  try {
    // TODO: Replace with easier way to validate user -> vehicule
    const vehicle = await Vehicle.findOne({
      _id: req.params.vehicle_id,
      owner: req.user._id,
    });
    if (!vehicle) {
      res.status(404).send();
    }
    const fillUp = await FillUp.findOneAndDelete({
      _id: req.params.fillup_id,
      owner: req.params.vehicle_id,
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

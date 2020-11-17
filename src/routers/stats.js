const express = require("express");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");

const { calculateVehicleStats } = require("../services/stats");

const router = new express.Router();

router.get("/vehicles/:vehicle_id/stats", auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.vehicle_id,
      owner: req.user._id,
    }).populate({
      path: "fillUps",
      options: {
        sort: { odometer: 1 },
      },
    });
    if (!vehicle) {
      res.status(404).send();
    }
    const removeOutliers = Boolean(req.query.removeOutliers);

    const stats = calculateVehicleStats(vehicle, removeOutliers);

    res.send(stats);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;

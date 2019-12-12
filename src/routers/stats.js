const express = require("express");
const ss = require("simple-statistics");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");

const router = new express.Router();

const filterOutliers = (list) => {
    if (list.length < 4)
        return list;

    let values, q1, q3, iqr, maxValue, minValue;

    values = list.slice().sort((a, b) => a - b);

    if ((values.length / 4) % 1 === 0) {
        q1 = 1 / 2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
        q3 = 1 / 2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
    } else {
        q1 = values[Math.floor(values.length / 4 + 1)];
        q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
    }

    iqr = q3 - q1;
    maxValue = q3 + iqr * 1.5;
    minValue = q1 - iqr * 1.5;

    return values.filter((x) => (x >= minValue) && (x <= maxValue));
};

router.get("/vehicles/:vehicle_id/stats", auth, async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({
            _id: req.params.vehicle_id,
            owner: req.user._id
        }).populate({
            path: "fillUps",
            options: {
                sort: { "odometer": 1 }
            }
        });
        if (!vehicle) {
            res.status(404).send();
        }

        let distancesBetweenFillUps = [];
        let fuelConsumptions = [];
        const odometerValues = [];

        for (let i = 0; i < vehicle.fillUps.length; i++) {
            const fillUp = vehicle.fillUps[i];
            const previousFillUp = vehicle.fillUps[i - 1];

            odometerValues.push(fillUp.odometer);

            if (previousFillUp) {
                const distanceTraveled = fillUp.odometer - previousFillUp.odometer;
                const fuelConsumption = distanceTraveled / fillUp.fuel;
                distancesBetweenFillUps.push(distanceTraveled);
                fuelConsumptions.push(fuelConsumption);
            }
        }

        if (req.query.removeOutliers === "true") {
            distancesBetweenFillUps = filterOutliers(distancesBetweenFillUps);
            fuelConsumptions = filterOutliers(fuelConsumptions);
        }

        const maxOdometerValue = odometerValues[odometerValues.length - 1];

        const averageDistanceBetweenFillUps = distancesBetweenFillUps.length ?
            ss.mean(distancesBetweenFillUps) : undefined;
        const maxDistanceBetweenFillUps = distancesBetweenFillUps.length ?
            ss.max(distancesBetweenFillUps) : undefined;
        const nextFillUp = averageDistanceBetweenFillUps ?
            maxOdometerValue + averageDistanceBetweenFillUps : undefined;
        const maxDistanceToFillUp = maxDistanceBetweenFillUps ?
            maxOdometerValue + maxDistanceBetweenFillUps : undefined;

        const averageFuelConsumption = fuelConsumptions.length ?
            ss.mean(fuelConsumptions) : undefined;
        const maxFuelConsumption = fuelConsumptions.length ?
            ss.max(fuelConsumptions) : undefined;
        const minFuelConsumption = fuelConsumptions.length ?
            ss.min(fuelConsumptions) : undefined;

        const stats = {
            averageDistanceBetweenFillUps: averageDistanceBetweenFillUps.toFixed(2),
            maxDistanceBetweenFillUps: maxDistanceBetweenFillUps.toFixed(2),
            nextFillUp: nextFillUp.toFixed(2),
            maxDistanceToFillUp: maxDistanceToFillUp.toFixed(2),
            averageFuelConsumption: averageFuelConsumption.toFixed(2),
            maxFuelConsumption: maxFuelConsumption.toFixed(2),
            minFuelConsumption: minFuelConsumption.toFixed(2),
        };

        res.send(stats);
    } catch (error) {
        res.status(400).send();
    }
});

module.exports = router;
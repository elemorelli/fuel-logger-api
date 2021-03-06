const express = require("express");
const sharp = require("sharp");
const Vehicle = require("../models/vehicle");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const imageFormatter = require("../middleware/image-formatter");

const router = new express.Router();

async function getVehicleById(req, res, auth = true) {
  const filter = auth ? {
        _id: req.params.vehicle_id,
        owner: res.locals.user._id,
      } : {
        _id: req.params.vehicle_id,
      };
  const vehicle = await Vehicle.findOne(filter);
  if (!vehicle) {
    res.status(404).end();
  }
  return vehicle;
}

router.post("/vehicles", auth, async (req, res) => {
  const vehicle = new Vehicle({
    ...req.body,
    owner: res.locals.user._id,
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
    const vehicles = await Vehicle.find(
      {
        ...matcher,
        owner: res.locals.user._id,
      },
      null,
      {
        skip: parseInt(req.query.skip),
        limit: parseInt(req.query.lmit),
        sort,
      }
    );
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
    res.status(500).end();
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
    allowedFields.forEach((field) => (vehicle[field] = req.body[field]));
    await vehicle.save();
    res.send(vehicle);
  } catch (error) {
    res.status(500).end();
  }
});

router.delete("/vehicles/:vehicle_id", auth, async (req, res) => {
  try {
    const vehicle = await getVehicleById(req, res);
    vehicle.remove();
    res.end();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/vehicles/:vehicle_id/picture", auth, upload.single("picture"), async (req, res) => {
  try {
    const vehicle = await getVehicleById(req, res);

    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
      })
      .webp()
      .toBuffer();

    vehicle.picture = buffer;
    await vehicle.save();
    res.end();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/vehicles/:vehicle_id/picture", async (req, res, next) => {
  try {
    const vehicle = await getVehicleById(req, res, false);

    if (!vehicle.picture) {
      res.status(404).end();
    } else {
      res.locals.image = vehicle.picture;
      next();
    }
  } catch (error) {
    res.status(400).end();
  }
}, imageFormatter);

router.delete("/vehicles/:vehicle_id/picture", auth, async (req, res) => {
  const vehicle = await getVehicleById(req, res);
  vehicle.picture = undefined;
  await vehicle.save();
  res.end();
});

module.exports = router;

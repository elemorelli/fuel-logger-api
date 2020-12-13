const express = require("express");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const imageFormatter = require("../middleware/image-formatter");

const router = new express.Router();

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    await user.save();
    res.send({ user, token });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    res.locals.user.tokens = res.locals.user.tokens.filter((token) => token.token !== res.locals.token);
    await res.locals.user.save();
    res.end();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/logout/all", auth, async (req, res) => {
  try {
    res.locals.user.tokens = [];
    await res.locals.user.save();
    res.end();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(res.locals.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedFields = ["name", "email", "password"];
  const isValidOperation = updates.every((update) => allowedFields.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid fields" });
  }
  try {
    updates.forEach((field) => (res.locals.user[field] = req.body[field]));
    await res.locals.user.save();
    res.send(res.locals.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    await res.locals.user.remove();
    res.end();
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250,
      })
      .webp()
      .toBuffer();

    res.locals.user.avatar = buffer;
    await res.locals.user.save();
    res.end();
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/users/me/avatar", auth, async (req, res, next) => {
  if (!res.locals.user || !res.locals.user.avatar) {
    res.status(404).end();
  } else {
    res.locals.image = user.avatar
    next();
  }
}, imageFormatter);

router.get("/users/:id/avatar", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    } else {
      res.locals.image = user.avatar
      next();
    }
  } catch (error) {
    res.status(404).end();
  }
}, imageFormatter);

router.delete("/users/me/avatar", auth, async (req, res) => {
  res.locals.user.avatar = undefined;
  await res.locals.user.save();
  res.end();
});

module.exports = router;

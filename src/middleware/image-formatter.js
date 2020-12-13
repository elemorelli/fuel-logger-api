const sharp = require("sharp");

const imageFormatter = async (req, res) => {
  const image = res.locals.image;

  try {
    if (req.query.format === "jpeg") {
      const formattedImage = await sharp(image).jpeg().toBuffer();
      res.type("jpeg");
      res.send(formattedImage);
    } else if (req.query.format === "png") {
      const formattedImage = await sharp(image).png().toBuffer();
      res.type("png");
      res.send(formattedImage);
    } else {
      res.type("webp");
      res.send(image);
    }
  } catch (error) {
    res.status(500).end();
  }
};

module.exports = imageFormatter;

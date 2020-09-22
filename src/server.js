console.clear();

const { PORT } = require("./environment");
const app = require("./app");
require("./db/mongoose");
require("./telegram-bot");

app.listen(PORT, () => {
    console.log("Server is up on port " + PORT);
});
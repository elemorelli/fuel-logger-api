const mongoose = require("mongoose");

const connectionURL = process.env.MONGODB_URL;

mongoose.connect(connectionURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to the DB");
}).catch((error) => {
    console.error("Error connecting to the DB", error);
    throw new Error(`Error connecting to the DB: ${error.message}`);
});
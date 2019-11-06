const app = require("./app");
const requiredEnvVariables = ["PORT", "MONGODB_URL", "JWT_SECRET"];

requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
        console.error(`WARNING: Environment variable '${envVariable}' is required`);
    }
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log("Server is up on port " + port);
});
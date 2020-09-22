console.clear();

const { PORT, SERVER_KEY, SERVER_CERT } = require('./environment');
const https = require('https');
const fs = require('fs');
const app = require('./app');
require('./db/mongoose');
require('./telegram-bot');

const server = https.createServer({
    key: fs.readFileSync(SERVER_KEY),
    cert: fs.readFileSync(SERVER_CERT)
}, app);

server.listen(PORT, () => {
    console.log('Server is up on port ' + PORT);
});
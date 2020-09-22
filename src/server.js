const { PORT } = require('./environment');
const logger = require('pino')();
const app = require('./app');
require('./db/mongoose');
require('./telegram-bot');

app.listen(PORT, () => {
    logger.info('Server is up on port ' + PORT);
});
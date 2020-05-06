const telegramAuth = async (req, res, next) => {
    try {
        const token = req.header("Telegram-Bot-Token");
        if (token !== process.env.TELEGRAM_BOT_TOKEN) {
            throw new Error();
        }
        next();
    } catch (error) {
        res.status(401).send({ error: "Invalid Telegram Bot Token" });
    }
};

module.exports = telegramAuth;
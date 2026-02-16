const logger = {
    info: (msg) => console.log(`\x1b[32m[INFO]\x1b[0m ${new Date().toISOString()}: ${msg}`),
    error: (msg, err) => {
        console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()}: ${msg}`);
        if (err) console.error(err);
    },
    warn: (msg) => console.warn(`\x1b[33m[WARN]\x1b[0m ${new Date().toISOString()}: ${msg}`),
};

module.exports = logger;

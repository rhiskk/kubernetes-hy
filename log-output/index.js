const crypto = require("crypto");
const random = crypto.randomBytes(20).toString('hex');

setInterval(() => {
    console.log(`${(new Date()).toISOString()}: ${random}`);
}, 5000)
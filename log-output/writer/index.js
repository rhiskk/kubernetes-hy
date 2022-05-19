const fs = require('fs');
const crypto = require("crypto");
const path = require('path');
const random = crypto.randomBytes(20).toString('hex');
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'status.txt');

setInterval(() => {
    const status = `${(new Date()).toISOString()}: ${random}`;
    fs.writeFileSync(filePath, status);
}, 5000);

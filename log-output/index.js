const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const crypto = require("crypto");
const random = crypto.randomBytes(20).toString('hex');
let status = ''

setInterval(() => {
    status = `${(new Date()).toISOString()}: ${random}`
    console.log(status);
}, 5000);

app.get('/', (_req, res) => {
    res.send(status);
});

server.listen(3000, () => {
    console.log(`Server started in port 3000`);
});
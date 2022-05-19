const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'status.txt');

app.get('/', (_req, res) => {
    try {
        const status = fs.readFileSync(filePath, 'utf-8');
        res.send(status);
    } catch (err) {
        res.send(err);
    }
});

server.listen(3000, () => {
    console.log(`Server started in port 3000`);
});
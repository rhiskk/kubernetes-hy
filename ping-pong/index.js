const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
const path = require('path');
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'pingpong.txt');

app.get('/pingpong', (_req, res) => {
    try {
        let visits = 0;
        if (fs.existsSync(filePath)) {
            visits = parseInt(fs.readFileSync(filePath, 'utf-8'));
        }
        visits++;
        fs.writeFileSync(filePath, visits.toString());
        res.send(`pong ${visits}`);
    } catch (err) {
        res.send(err);
    }
});

server.listen(3000, () => {
    console.log(`Server started in port 3000`);
});
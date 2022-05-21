const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const fs = require('fs');
const path = require('path');
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'pingpong.txt');

const getVisits = async () => new Promise(res => {
    const visits = fs.existsSync(filePath)
        ? parseInt(fs.readFileSync(filePath, 'utf-8')) + 1
        : 1;
    fs.writeFileSync(filePath, visits.toString());
    return res(visits);
});

app.get('/pingpong', async (_req, res) => {
    try {
        const visits = await getVisits();
        console.log(visits);
        res.send(`pong ${visits}`);
    } catch (err) {
        res.send(err);
    }
});

server.listen(3000, () => {
    console.log(`Server started in port 3000`);
});
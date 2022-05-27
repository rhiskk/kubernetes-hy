const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'status.txt');
const axios = require('axios');
const PINGPONG_URL = process.env.PINGPONG_URL || 'http://ping-pong-svc:2346/pingpong';

const getPings = async () => {
    try {
        const res = await axios.get(PINGPONG_URL);
        return res.data;
    } catch (err) {
        throw err;
    }
};

app.get('/', async (_req, res) => {
    try {
        const status = fs.readFileSync(filePath, 'utf-8');
        const pings = await getPings();
        res.send(`${status}. <br/> Ping / Pongs: ${pings}`);
    } catch (err) {
        res.send(err);
    }
});

server.listen(3000, () => {
    console.log(`Server started in port 3000`);
});
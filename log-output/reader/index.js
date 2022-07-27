const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const filePath = path.join(directory, 'status.txt');
const axios = require('axios');
const PINGPONG_URL = process.env.PINGPONG_URL || 'http://ping-pong-svc:2346';
require('dotenv').config({ path: path.join(directory, '../config/.env') });

const getPings = async () => {
    try {
        const res = await axios.get(`${PINGPONG_URL}/pingpong`);
        return res.data;
    } catch (err) {
        throw err;
    }
};

app.get('/', async (_req, res) => {
    try {
        const status = fs.readFileSync(filePath, 'utf-8');
        const pings = await getPings();
        res.send(`${process.env.MESSAGE} <br/> ${status}. <br/> Ping / Pongs: ${pings}`);
    } catch (err) {
        res.send(err);
    }
});

app.get('/healthz', async (_req, res) => {
    try {
        const healthz = await axios.get(`${PINGPONG_URL}`);
        console.log(healthz.status);
        res.sendStatus(healthz.status);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

server.listen(3000, () => {
    console.log(`Server started in port 3000`);
});
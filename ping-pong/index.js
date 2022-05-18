const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
let visits = 0;

app.get('/pingpong', (_req, res) => {
    visits++;
    res.send(`pong ${visits}`);
});

server.listen(3000, () => {
    console.log(`Server started in port 3000`);
});
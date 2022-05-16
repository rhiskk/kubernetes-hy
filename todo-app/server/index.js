const { PORT } = require('./util/config');
const app = require('./app');
const http = require('http');

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`)
})
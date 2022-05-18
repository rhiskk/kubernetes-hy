const { PORT } = require('./util/config');
const app = require('./app');
const http = require('http');

const server = http.createServer(app);

app.get('/', (_req, res) => {
    res.sendFile('1.05/hello.html', {root: __dirname })
});

server.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`)
})
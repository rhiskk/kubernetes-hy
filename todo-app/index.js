const { PORT } = require('./util/config');
const express = require('express');
const app = express();
const http = require('http');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const server = http.createServer(app);
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const imagePath = path.join(directory, 'image.jpg');
const datePath = path.join(directory, 'date.txt');

const previousDate = async () => {
    const previous = fs.existsSync(datePath)
        ? fs.readFileSync(datePath, 'utf-8')
        : new Date('1970-01-01').toDateString();
    return previous;
};

const newDay = async () => {
    const currentDate = new Date().toDateString();
    if (await previousDate() !== currentDate) {
        fs.writeFileSync(datePath, currentDate);
        return true;
    }
    return false;
};

const findAFile = async () => {
    if (fs.existsSync(imagePath)) return;
    await new Promise(res => fs.mkdir(directory, (_err) => res()));
    const response = await axios.get('https://picsum.photos/200', { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(imagePath));
};

const removeImage = async () => new Promise(res => fs.unlink(imagePath, (err) => {
    if (err) console.log(err);
    console.log(imagePath + " deleted");
    res();
}));

app.use('/files', express.static(path.join(__dirname, 'files')));
app.get('*', async (_req, res) => {
    if (await newDay()) await removeImage();
    await findAFile();
    res.sendFile(path.resolve('static', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`);
});
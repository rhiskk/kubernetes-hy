const { PORT } = require('./util/config');
const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const server = http.createServer(app);
const directory = path.join('/', 'usr', 'src', 'app', 'files');
const imagePath = path.join(directory, 'image.jpg');
const datePath = path.join(directory, 'date.txt');
const { v1: uuid } = require('uuid');
app.use(express.json());
app.use(cors());
let todos = [
    {
        id: 1,
        text: "TODO 1",
        important: true
    },
    {
        id: 2,
        text: "TODO 2",
        important: false
    },
    {
        id: 3,
        text: "TODO 3",
        important: true
    },
];

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

const findAnImage = async () => {
    if (fs.existsSync(imagePath)) return;
    await new Promise(res => fs.mkdir(directory, (_err) => res()));
    const response = await axios.get('https://picsum.photos/200', { responseType: 'arraybuffer' });
    const image = Buffer.from(response.data, 'binary');
    fs.writeFileSync(imagePath, image);
};

const removeImage = async () => new Promise(res => fs.unlink(imagePath, (err) => {
    if (err) console.log(err);
    console.log(imagePath + " deleted");
    res();
}));

app.use('/files', express.static(path.join(__dirname, 'files')));

app.get('/api/image', async (_req, res) => {
    if (await newDay()) await removeImage();
    await findAnImage();
    res.sendFile(path.resolve('files', 'image.jpg'));
});

app.get('/api/todos', (_req, res) => {
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const body = req.body;
    if (!body.text) {
        return res.status(400).json({
            error: 'text missing'
        });
    }
    const todo = {
        text: body.text,
        done: body.important || false,
        id: uuid()
    };
    todos = todos.concat(todo);
    console.log(todo);
    res.json(todo);
});

server.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`);
});
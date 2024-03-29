const { PORT, PG_PASSWORD, PG_USER, PG_DB, DB_HOST } = require('./util/config');
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
const { Sequelize, Model, DataTypes } = require('sequelize');
const NATS = require('nats');
app.use(express.json());
app.use(cors());

let nc = null;
const jc = NATS.JSONCodec();

const errorHandler = (err, _req, res, next) => {
    if (err.name === "SequelizeDatabaseError") {
        console.log(err.message);
        return res.status(400).json({ error: err.message });
    } else if (err.name === "SequelizeValidationError") {
        console.log(err.message);
        return res.status(400).json({ error: err.message });
    }
    next(err);
};

const requestLogger = (req, _res, next) => {
    console.log("Method:", req.method);
    console.log("Path:  ", req.path);
    console.log("Body:  ", req.body);
    console.log("---");
    next();
};


const sequelize = new Sequelize(PG_DB, PG_USER, PG_PASSWORD, {
    host: DB_HOST,
    dialect: "postgres"
});

class Todo extends Model { }
Todo.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [2, 140],
                msg: "Todo length must be between 2 and 140 characters."
            }
        }
    },
    done: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    underscored: true,
    timestamps: false,
    modelName: 'todo'
});

Todo.sync();

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
app.use(requestLogger);

app.get('/api/image', async (_req, res) => {
    if (await newDay()) await removeImage();
    await findAnImage();
    res.sendFile(path.resolve('files', 'image.jpg'));
});

app.get('/api/todos', async (_req, res, next) => {
    try {
        const todos = await Todo.findAll({});
        res.json(todos);
    } catch (err) {
        next(err);
    }
});

app.post('/api/todos', async (req, res, next) => {
    const body = req.body;
    try {
        const todo = await Todo.create({
            text: body.text,
            done: body.done || false,
        });
        res.status(201).json(todo);
        const payload = { action: 'created', todo };
        nc.publish('todo', jc.encode(payload));
    } catch (err) {
        next(err);
    }
});

app.put('/api/todos/:id', async (req, res, next) => {
    try {
        const todo = await Todo.findByPk(req.params.id);
        todo.done = !todo.done;
        await todo.save();
        res.status(200).json(todo);
        const payload = { action: 'updated', todo };
        nc.publish('todo', jc.encode(payload));
    } catch (err) {
        next(err);
    }
});

app.get('/', (_req, res) => {
    res.sendStatus(200);
});

app.get('/api', (_req, res) => {
    res.sendStatus(200);
});

app.get('/healthz', async (_req, res) => {
    try {
        await sequelize.authenticate();
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database');
        nc = await NATS.connect({
            servers: process.env.NATS_URL || 'nats://my-nats:4222'
        });
        console.log(`Connected to NATS at ${nc.getServer()}`);
        server.listen(PORT, () => {
            console.log(`Server started in port ${PORT}`);
        });
    } catch (err) {
        console.error(err);
    }
};

start();
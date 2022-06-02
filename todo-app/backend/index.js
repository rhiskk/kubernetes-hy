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

app.use(express.json());
app.use(cors());

const errorHandler = (err, _req, res, next) => {
    console.log(err);
    if (err.name === "SequelizeDatabaseError") {
        return res.status(400).json({ error: err.message });
    } else if (err.name === "SequelizeValidationError") {
        return res.status(400).json({ error: err.message });
    }
    next(err);
};

app.use(errorHandler);

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
            max: 140
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
            done: body.important || false,
        });
        res.status(201).json(todo);
    } catch (err) {
        next(error);
    }
});

server.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`);
});
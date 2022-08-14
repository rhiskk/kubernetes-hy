const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize("pingpong-db", "postgres",
    process.env.POSTGRES_PASSWORD, {
    host: "postgres-svc",
    dialect: "postgres"
});

class Ping extends Model { }
Ping.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    visits: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    timestamps: false,
    modelName: 'ping'
});

Ping.sync();

const getVisits = async () => {
    const [ping, _created] = await Ping.findOrCreate({
        where: { id: 1 },
        defaults: { visits: 0 }
    });
    const visits = await ping.increment('visits').then(p => p.visits);
    return visits;
};

app.get('/pingpong', async (_req, res) => {
    try {
        const visits = await getVisits();
        console.log(visits);
        res.json(visits);
    } catch (err) {
        res.send(err);
    }
});

app.get('/', (_req, res) => {
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

server.listen(8080, () => {
    console.log(`Server started in port 8080`);
});
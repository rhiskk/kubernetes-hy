const express = require('express');
const axios = require('axios');
const app = express();
const http = require('http');
const server = http.createServer(app);
const website_url = process.env.WEBSITE_URL;

const getWebsite = async () => {
  const response = await axios.get(website_url);
  return response.data;
};

app.get('*', async (_req, res) => {
  const website = await getWebsite();
  res.send(website);
});

server.listen(80, () => {
  console.log(`Server started in port 80`);
});
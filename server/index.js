'use strict';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

var ws;

const api = require('./api');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static('../client'))

app.get('/api/reportes', (req, res) => {
  api.search(req.query.filter, (err, data) => {
  	res.send(data);	
  })
});

io.on('connection', (socket) => {
  ws = socket;
});

server.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

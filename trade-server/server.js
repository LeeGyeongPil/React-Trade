const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*', } });
const Coins = require('./Coins/Coins');

var coins = new Coins(io);
app.get('/socket.io/', function (req, res) {
});

io.on('connection', (socket) => {
	console.log('connect');
	io.to(socket.id).emit('flush',coins.get());
	socket.on('trade', (msg) => {
		io.emit('flush', coins.trade(msg));
	});
});

server.listen(3001, 
	function(){ 
		console.log('Server Running...');
	}
);
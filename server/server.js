const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io');
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
	console.log('Server started');
});

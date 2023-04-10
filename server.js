const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3001;
const ACTIONS = require('./src/socket/actions');
const { version, validate } = require('uuid');

function getClientRooms() {
	const { rooms } = io.sockets.adapter;
	return Array.from(
		rooms.keys().filter(roomId => validate(roomId) && version(roomId) === 4)
	);
}

function shareRoomsInfo() {
	io.emit(ACTIONS.SHARE_ROOM, {
		rooms: getClientRooms(),
	});
}

io.on('connection', socket => {
	shareRoomsInfo();
	socket.on(ACTIONS.JOIN, config => {
		const { room: roomId } = config;
		const { rooms: joinedRooms } = socket;

		if (Array.from(joinedRooms).includes(roomId)) {
			return console.warn(`Already joined to ${roomId}`);
		}
		const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

		clients.forEach(clientId => {
			io.to(clientId).emit(ACTIONS.ADD_PEER, {
				peerId: socket.id,
				createOffer: false,
			});
			socket.emit(ACTIONS.ADD_PEER, {
				peerId: clientId,
				createOffer: true,
			});
		});
		socket.join(roomId);
		shareRoomsInfo();
	});

	function leaveRoom() {
		const { rooms } = socket;
		Array.from(rooms).forEach(roomId => {
			const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
			clients.forEach(clientId => {
				io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
					peerId: socket.id,
				});
				socket.emit(ACTIONS.REMOVE_PEER, {
					peerId: clientId,
				});
			});
			socket.leave(roomId);
		});
		shareRoomsInfo();
	}

	socket.on(ACTIONS.LEAVE, leaveRoom);
	socket.on('disconnecting', leaveRoom);
});

server.listen(PORT, () => {
	console.log('Server started');
});

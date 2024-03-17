import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: [`${process.env.CLIENT_URL}`, "http://localhost:5173"],   // this env url is giving error
		methods: ["GET", "PUT","POST"],
	},
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection",  (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	
	if (userId != "undefined") userSocketMap[userId] = socket.id;
    
	// io.emit() is used to send events to all the connected clients
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	console.log( userSocketMap );     // {userId: socketId} for online users
	io.emit("getRequests", );
	
	// socket.on() is used to listen to the events. can be used both on client and server side
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId];
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});
});

export { app, io, server };
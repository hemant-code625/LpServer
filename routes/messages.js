import express from "express";
import Conversation from "../models/conversation.js";
import Message from "../models/message.js";
import { getReceiverSocketId } from "../socket.js";
import { io } from "../socket.js";
const router = express.Router();


router.get("/:id", async (req, res) => {                  // here also the id is of userToChat (receiverId) 
	try {
		const { id: userToChatId } = req.params;
		// const user = await getUser();
		const senderId = req.user;
		console.log("senderId", senderId);
		// const senderId = "65f67e5691c87421cd8dbed6"

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages");                                 // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json(["No messages yet!"]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}});

	
router.post("/send/:id", async (req, res) => {                     // recieverId in params
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user.data._id;
		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage route: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	
        }
    });

export default router;
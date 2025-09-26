// routes/messages.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Get chat history with a specific user
router.get('/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id },
            ],
        }).sort({ createdAt: 'asc' });
        res.json(messages);
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

// Send a new message
router.post('/', auth, async (req, res) => {
    const { receiverId, content } = req.body;
    try {
        const newMessage = new Message({
            sender: req.user.id,
            receiver: receiverId,
            content: content,
        });
        const message = await newMessage.save();
        res.status(201).json(message);
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;
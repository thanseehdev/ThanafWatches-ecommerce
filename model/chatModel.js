// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderType: { type: String, enum: ['admin', 'user'] }, // Indicates sender type: admin or user
    sender: String,
    text: String,
    sender2:String,
    adminReply: String, // Stores the admin's reply
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);

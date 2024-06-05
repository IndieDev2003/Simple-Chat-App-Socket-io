const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/chat-app', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for messages
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Load existing messages from the database
  Message.find().then(messages => {
    socket.emit('init', messages);
  });

  // Listen for new messages
  socket.on('chat message', (data) => {
    const newMessage = new Message(data);
    newMessage.save().then(() => {
      io.emit('chat message', data);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

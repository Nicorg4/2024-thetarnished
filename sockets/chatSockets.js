const Message = require('../models/messageModel');

const getRoomId = (id1, id2) => {
  const [first, second] = [id1, id2].sort();
  return `room-${first}-${second}`;
};


module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('joinRoom', async ({ studentId, teacherId }) => {
      const roomId = getRoomId(studentId, teacherId);
      socket.join(roomId);

      const messages = await Message.findAll({
        where: { roomId },
        order: [['timestamp', 'ASC']]
      });

      socket.emit('messageHistory', messages);
    });

    socket.on('sendMessage', async ({ studentId, teacherId, message, sender, fileid }) => {
      const roomId = getRoomId(studentId, teacherId);

      const newMessage = await Message.create({
        studentId,
        teacherId,
        sender,
        message,
        roomId,
        fileid,
      });

      io.to(roomId).emit('message', newMessage);

    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

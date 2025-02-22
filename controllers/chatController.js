const Message = require('../models/messageModel');

getMessages = async (req, res) => {
  const { roomId } = req.params;
  try {
    const messages = await Message.findAll({
      where: { roomId },
      order: [['timestamp', 'ASC']]
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
};


module.exports = {
  getMessages
};
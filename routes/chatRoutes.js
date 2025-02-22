const express = require('express');
const { getMessages } = require('../controllers/chatController');

const router = express.Router();

router.get('/messages/:roomId', getMessages);

module.exports = router;

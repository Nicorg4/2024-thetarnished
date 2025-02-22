const express = require('express');
const { createMeeting } = require('../controllers/meetingController');
const authorizeRoles = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authorizeRoles('TEACHER'), createMeeting);

module.exports = router;
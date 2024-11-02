const express = require('express');
const { completeQuiz } = require('../controllers/quizController');
const authorizeRoles = require('../middleware/authMiddleware');

const app = express();
app.use(express.json());

const router = express.Router();

router.put('/complete-quiz/:userid', authorizeRoles('STUDENT', 'TEACHER'), completeQuiz);

module.exports = router;
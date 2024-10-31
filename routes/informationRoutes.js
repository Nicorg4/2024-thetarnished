const express = require('express');
const { getAnalytics, getTeacherStats, getStudentStats, getUsersRanking } = require('../controllers/informationController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');

app.use(express.json());

const router = express.Router();

router.get('/get-analytics', authorizeRoles('ADMIN'), getAnalytics);
router.get('/get-teacher-stats/:teacherid', getTeacherStats);
router.get('/get-student-stats/:studentid', getStudentStats);
router.get('/get-users-ranking', authorizeRoles('TEACHER', 'STUDENT'), getUsersRanking);

module.exports = router;
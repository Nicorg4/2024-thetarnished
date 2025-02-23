const express = require('express');
const {
    getIndividualClasses,
    getGroupClasses,
    getMonthlyScheduleByTeacherId,
    getMonthlySubjectScheduleByTeacherId
} = require('../controllers/monthlyScheduleController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');

app.use(express.json());

const router = express.Router();

router.get('/get-monthly-schedule-by/:teacherid', authorizeRoles('STUDENT', 'TEACHER'), getMonthlyScheduleByTeacherId);
router.get('/group-classes', authorizeRoles('STUDENT'), getGroupClasses);
router.get('/individual-classes', authorizeRoles('STUDENT'), getIndividualClasses);


module.exports = router;
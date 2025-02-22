const express = require('express');
const {
    createExamWithQuestions,
    deleteExam,
    getExamsByTeacherId,
    getExamsByStudentId,
    getExamsById,
    initiateExam,
    submitExam
} = require('../controllers/examController');
const authorizeRoles = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-exam', authorizeRoles('TEACHER'), createExamWithQuestions);
router.delete('/delete-exam', authorizeRoles('TEACHER'),  deleteExam);
router.get('/get-teacher-exams-by/:teacher_id', authorizeRoles('TEACHER'), getExamsByTeacherId);
router.get('/get-student-exams-by/:student_id', authorizeRoles('STUDENT'), getExamsByStudentId);
router.get('/get-exams-by/:exam_id/:userid', authorizeRoles('STUDENT'), getExamsById);
router.put('/initiate-exam/:exam_id', authorizeRoles('STUDENT'), initiateExam);
router.put('/submit-exam/:exam_id', authorizeRoles('STUDENT'), submitExam);


module.exports = router;
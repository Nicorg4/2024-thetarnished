const express = require('express');
const {
    getTeacherById, 
    updateTeacher, 
    deleteTeacher, 
    assignSubjectToTeacher, 
    removeSubjectFromTeacher, 
    getAllTeachersDictatingASubjectById, 
    updateTeacherAvatar,
    getPreviousStudents
} = require('../controllers/teacherController');

const router = express.Router();

const authorizeRoles = require('../middleware/authMiddleware');

router.get('/all-dictating/:subjectid', authorizeRoles('STUDENT'), getAllTeachersDictatingASubjectById);
router.get('/:id', authorizeRoles('ADMIN', 'STUDENT', 'TEACHER'), getTeacherById);
router.put('/update/:id', authorizeRoles('TEACHER'), updateTeacher);
router.delete('/delete/:id', authorizeRoles('TEACHER', 'ADMIN'), deleteTeacher);
router.post('/assign-subject/:teacherid', authorizeRoles('ADMIN', 'TEACHER'), assignSubjectToTeacher);
router.delete('/remove-subject/:teacherid/', authorizeRoles('ADMIN', 'TEACHER'), removeSubjectFromTeacher);
router.put('/update-avatar/:id', authorizeRoles('TEACHER'), updateTeacherAvatar);
router.get('/get-previous/:teacher_id/', authorizeRoles('TEACHER'), getPreviousStudents);

module.exports = router;
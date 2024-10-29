const express = require('express');
const {getStudentById, updateStudent, deleteStudent, getPreviousTeachers, updateStudentAvatar} = require('../controllers/studentController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');

app.use(express.json()); 



const router = express.Router();

router.get('/:id', authorizeRoles('STUDENT', 'TEACHER', 'ADMIN'), getStudentById);
router.put('/update/:id', authorizeRoles('STUDENT', 'ADMIN'), updateStudent);
router.delete('/delete/:id', authorizeRoles('STUDENT', 'ADMIN'), deleteStudent);
router.get('/get-previous/:id/:subjectid', authorizeRoles('STUDENT'), getPreviousTeachers);
router.put('/update-avatar/:id', authorizeRoles('STUDENT'), updateStudentAvatar);

module.exports = router;
const express = require('express');
const { getAllSubjects, getSubjectById, createSubject, getAllSubjectsDictatedByTeachers, updateSubject, getSubjectPrice } = require('../controllers/subjectController');
const authorizeRoles = require('../middleware/authMiddleware');
const app = express();

app.use(express.json()); 

const router = express.Router();

router.get('/all-subjects-dictated', authorizeRoles('STUDENT'), getAllSubjectsDictatedByTeachers);
router.get('/all-subjects', getAllSubjects);
router.post('/create', authorizeRoles('ADMIN'), createSubject);
router.put('/update-subject/:id', authorizeRoles('ADMIN'), updateSubject);
router.get('/get-price/:subjectid', authorizeRoles('STUDENT', 'TEACHER'), getSubjectPrice);

module.exports = router;


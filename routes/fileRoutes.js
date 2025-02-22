const express = require('express');
const { uploadFile, getFilesByStudentId, assignFileToStudent, downloadFileById, getAllTeacherFiles, unassignFileToStudent, uploadChatFile } = require('../controllers/fileController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware')

app.use(express.json());
const router = express.Router();

router.post('/upload', upload.single('file'), authorizeRoles('TEACHER'), uploadFile);
router.post('/upload-from-chat', upload.single('file'), authorizeRoles('TEACHER', 'STUDENT'), uploadChatFile);
router.post('/assign-file/:file_id/to/:student_id', authorizeRoles('TEACHER'), assignFileToStudent);
router.delete('/unassign-file/:file_id/to/:student_id', authorizeRoles('TEACHER'), unassignFileToStudent);
router.get('/all-files-by/:student_id', authorizeRoles('STUDENT'), getFilesByStudentId);
router.get('/teacher-files-by/:teacher_id', authorizeRoles('TEACHER'), getAllTeacherFiles);
router.get('/download/:file_id', authorizeRoles('TEACHER', 'STUDENT'), downloadFileById);

module.exports = router;

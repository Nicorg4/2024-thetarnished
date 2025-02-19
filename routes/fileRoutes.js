const express = require('express');
const { uploadFile, getFilesByStudentId, assignFileToStudent, downloadFileById } = require('../controllers/fileController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware')

app.use(express.json());
const router = express.Router();

router.post('/upload', upload.single('file'), uploadFile);
router.post('/assign-file/:file_id/to/:student_id', assignFileToStudent);
router.get('/all-files-by/:student_id', getFilesByStudentId);
router.get('/download/:file_id', downloadFileById);

module.exports = router;

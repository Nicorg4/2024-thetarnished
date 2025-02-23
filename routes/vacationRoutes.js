const express = require('express');

const app = express();
const authorizeRoles = require('../middleware/authMiddleware');
const { stopVacation, assignVacation } = require('../controllers/vacationController');

app.use(express.json());

const router = express.Router();

router.post('/assign-vacation', authorizeRoles('TEACHER'), assignVacation);
router.post('/stop-vacation', authorizeRoles('TEACHER'), stopVacation);

module.exports = router;
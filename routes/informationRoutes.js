const express = require('express');
const { getAnalytics } = require('../controllers/informationController');
const app = express();
const authorizeRoles = require('../middleware/authMiddleware');

app.use(express.json());

const router = express.Router();

router.get('/get-analytics', authorizeRoles('ADMIN'), getAnalytics);

module.exports = router;